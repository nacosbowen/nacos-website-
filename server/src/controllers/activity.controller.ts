import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/admin/activity?role=&entityType=&search=&page=
export const getActivityLog = asyncHandler(async (req: Request, res: Response) => {
  const { role, entityType, search } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const pageSize = 30;

  const where = {
    ...(role && { userRole: String(role) }),
    ...(entityType && { entityType: String(entityType) }),
    ...(search && {
      userName: { contains: String(search), mode: 'insensitive' as const },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return res.json({
    items,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  });
});