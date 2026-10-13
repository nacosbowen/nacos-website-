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