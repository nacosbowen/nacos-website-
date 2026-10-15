import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

const countByMatric = (...codes: string[]) =>
  prisma.studentRegistry.count({
    where: { OR: codes.map((c) => ({ matricNumber: { contains: c } })) },
  });

// GET /api/stats  (exec/admin)
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [students, notifications, upcomingEvents, suggestions, csc, sen, cyb, ift] =
    await Promise.all([
      prisma.studentRegistry.count(),
      prisma.notification.count(),
      prisma.event.count({ where: { date: { gte: new Date() } } }),
      prisma.suggestion.count(),
      countByMatric('CSC', 'CIT'),
      countByMatric('SEN'),
      countByMatric('CYB'),
      countByMatric('IFT'),
    ]);

  return res.json({
    students,
    notifications,
    upcomingEvents,
    suggestions,
    departments: { CSC: csc, SEN: sen, CYB: cyb, IFT: ift },
  });
});

// GET /api/stats/course-rep  (course rep)
export const getCourseRepStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const assign = await prisma.courseRepAssignment.findFirst({
    where: { userId },
    orderBy: { assignedAt: 'asc' },
    include: { department: true },
  });

  const [notificationsSent, questionsUploaded] = await Promise.all([
    prisma.notification.count({ where: { createdById: userId } }),
    prisma.pastQuestion.count({ where: { uploadedById: userId } }),
  ]);

  let students = 0;
  if (assign) {
    const code = assign.department.code;
    const codes = code === 'CSC' ? ['CSC', 'CIT'] : [code];
    students = await prisma.studentRegistry.count({
      where: {
        level: assign.level,
        OR: codes.map((c) => ({ matricNumber: { contains: c } })),
      },
    });
  }

  return res.json({ students, notificationsSent, questionsUploaded });
});