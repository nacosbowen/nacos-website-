import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { logActivity } from '../lib/activity';

// GET /api/exams?departmentId=&level=
export const getExams = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, level } = req.query;

  if (!departmentId || !level) {
    return res.status(400).json({ message: 'departmentId and level are required' });
  }

  const exams = await prisma.examEntry.findMany({
    where: {
      departmentId: Number(departmentId),
      level: Number(level),
    },
    orderBy: { date: 'asc' },
  });

  return res.json(exams);
});

// POST /api/exams  (admin / executive)
export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { departmentId, level, courseCode, courseTitle, date, time, duration, venue } = req.body;

  if (!departmentId || !level || !courseCode || !courseTitle || !date || !time || !duration) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const exam = await prisma.examEntry.create({
    data: {
      departmentId: Number(departmentId),
      level: Number(level),
      courseCode: courseCode.toUpperCase().trim(),
      courseTitle: courseTitle.trim(),
      date: new Date(date),
      time,
      duration,
      venue,
    },
  });

  await logActivity(userId, 'created', 'exam', `${exam.courseCode} (${exam.level}L)`);
  return res.status(201).json(exam);
});

// DELETE /api/exams/:id  (admin / executive)
export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const exam = await prisma.examEntry.delete({ where: { id: req.params.id } });
  await logActivity(userId, 'deleted', 'exam', `${exam.courseCode} (${exam.level}L)`);
  return res.json({ message: 'Exam deleted' });
});