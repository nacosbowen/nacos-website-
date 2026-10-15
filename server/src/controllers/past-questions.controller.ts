import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadPdfBuffer } from '../lib/cloudinary';

function parseDepartmentIds(raw: unknown): number[] {
  const parts = Array.isArray(raw) ? raw : String(raw ?? '').split(',');
  const ids = parts.map((p) => Number(p)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 4);
  return Array.from(new Set(ids));
}

// GET /api/past-questions?level=&courseCode=&departmentId=&year=
// With departmentId: return questions whose list contains that department,
// plus those with an empty list (meaning all departments).
export const getPastQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { level, courseCode, departmentId, year } = req.query;

  const questions = await prisma.pastQuestion.findMany({
    where: {
      ...(level && { level: Number(level) }),
      ...(courseCode && { courseCode: (courseCode as string).toUpperCase() }),
      ...(departmentId && {
        OR: [
          { departmentIds: { has: Number(departmentId) } },
          { departmentIds: { isEmpty: true } },
        ],
      }),
      ...(year && { year: Number(year) }),
    },
    orderBy: [{ courseCode: 'asc' }, { year: 'desc' }],
  });

  return res.json(questions);
});

// POST /api/past-questions  (multer handles file)
export const uploadPastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!file) return res.status(400).json({ message: 'PDF file is required' });

  const { title, courseCode, level, year, departmentIds, departmentId } = req.body;

  if (!title || !courseCode || !year) {
    return res.status(400).json({ message: 'title, courseCode, and year are required' });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  const userRoles = user?.roles.map((ur) => ur.role.name) ?? [];
  const isStaff = userRoles.includes('admin') || userRoles.includes('executive');

  let finalLevel: number;
  let finalDepartmentIds: number[];

  if (isStaff) {
    // executives and admins choose freely, as before
    if (!level) return res.status(400).json({ message: 'level is required' });
    finalLevel = Number(level);
    finalDepartmentIds = parseDepartmentIds(departmentIds);
  } else {
    // course reps: the class comes from their assignment, never from the request
    const assignments = await prisma.courseRepAssignment.findMany({ where: { userId } });
    if (assignments.length === 0) {
      return res.status(403).json({ message: 'You are not assigned as a course rep' });
    }

    let assignment;
    if (departmentId !== undefined && level !== undefined) {
      assignment = assignments.find(
        (a) => a.departmentId === Number(departmentId) && a.level === Number(level)
      );
      if (!assignment) {
        return res.status(403).json({ message: 'You can only upload for your own class' });
      }
    } else if (assignments.length === 1) {
      assignment = assignments[0];
    } else {
      return res.status(400).json({ message: 'Choose which class this is for' });
    }

    finalLevel = assignment.level;
    finalDepartmentIds = [assignment.departmentId];
  }

  const fileUrl = await uploadPdfBuffer(file.buffer, 'nacos/past-questions');
  const question = await prisma.pastQuestion.create({
    data: {
      title: title.trim(),
      courseCode: courseCode.toUpperCase().trim(),
      level: finalLevel,
      year: Number(year),
      departmentIds: finalDepartmentIds,
      fileUrl,
      uploadedById: userId,
    },
  });

  return res.status(201).json(question);
});

// GET /api/past-questions/mine  (course reps): only this user's own uploads
export const getMyPastQuestions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const questions = await prisma.pastQuestion.findMany({
    where: { uploadedById: userId },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(questions);
});

// DELETE /api/past-questions/:id  (admin / uploader)
export const deletePastQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const question = await prisma.pastQuestion.findUnique({ where: { id: req.params.id } });
  if (!question) return res.status(404).json({ message: 'Not found' });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  const userRoles = user?.roles.map((ur) => ur.role.name) ?? [];
const canManageAll = userRoles.includes('admin') || userRoles.includes('executive');

if (question.uploadedById !== userId && !canManageAll) {
    return res.status(403).json({ message: 'You can only delete your own uploads' });
  }

  await prisma.pastQuestion.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Deleted' });
});