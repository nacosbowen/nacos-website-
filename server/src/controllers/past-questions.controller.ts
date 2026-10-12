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

  const { title, courseCode, level, year, departmentIds } = req.body;

if (!title || !courseCode || !level || !year) {
  return res.status(400).json({ message: 'title, courseCode, level, and year are required' });
}

const fileUrl = await uploadPdfBuffer(file.buffer, 'nacos/past-questions');
  const question = await prisma.pastQuestion.create({
    data: {
      title: title.trim(),
      courseCode: courseCode.toUpperCase().trim(),
      level: Number(level),
      year: Number(year),
     departmentIds: parseDepartmentIds(departmentIds),
      fileUrl,
      uploadedById: userId,
    },
  });

  return res.status(201).json(question);
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