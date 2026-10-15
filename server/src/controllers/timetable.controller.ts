import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// Looks up whether the caller is an admin, and which department/level
// combinations they are assigned to as a course rep.
async function getScope(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } }, courseRepAssigns: true },
  });
  const isAdmin = !!user?.roles.some(
  (ur) => ur.role.name === 'admin' || ur.role.name === 'executive'
);
  return { isAdmin, assigns: user?.courseRepAssigns ?? [] };
}

// GET /api/timetable?departmentId=&level=
export const getTimetable = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, level } = req.query;

  if (!departmentId || !level) {
    return res.status(400).json({ message: 'departmentId and level are required' });
  }

  const entries = await prisma.timetableEntry.findMany({
    where: {
      departmentId: Number(departmentId),
      level: Number(level),
    },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
  });

  return res.json(entries);
});

// POST /api/timetable  (course_rep / admin)
// Course reps are locked to their own department and level: whatever the
// client sends for those two fields is ignored. Admins can set any.
export const createTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { courseCode, courseTitle, day, startTime, endTime, venue } = req.body;
  let { departmentId, level } = req.body;

  if (!courseCode || !courseTitle || !day || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const { isAdmin, assigns } = await getScope(userId);

  if (!isAdmin) {
    if (assigns.length === 0) {
      return res.status(403).json({ message: 'You have not been assigned a department and level' });
    }
    departmentId = assigns[0].departmentId;
    level = assigns[0].level;
  }

  if (!departmentId || !level) {
    return res.status(400).json({ message: 'departmentId and level are required' });
  }

  const entry = await prisma.timetableEntry.create({
    data: {
      departmentId: Number(departmentId),
      level: Number(level),
      courseCode: courseCode.toUpperCase().trim(),
      courseTitle: courseTitle.trim(),
      day,
      startTime,
      endTime,
      venue,
    },
  });

  return res.status(201).json(entry);
});

// PATCH /api/timetable/:id  (course_rep / admin)
export const updateTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { courseCode, courseTitle, day, startTime, endTime, venue } = req.body;

  const existing = await prisma.timetableEntry.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Entry not found' });

  const { isAdmin, assigns } = await getScope(userId);
  const allowed = assigns.some(
    (a) => a.departmentId === existing.departmentId && a.level === existing.level
  );
  if (!isAdmin && !allowed) {
    return res.status(403).json({ message: 'You can only edit your own timetable' });
  }

  const entry = await prisma.timetableEntry.update({
    where: { id: req.params.id },
    data: {
      ...(courseCode && { courseCode: courseCode.toUpperCase().trim() }),
      ...(courseTitle && { courseTitle: courseTitle.trim() }),
      ...(day && { day }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(venue !== undefined && { venue }),
    },
  });

  return res.json(entry);
});

// DELETE /api/timetable/:id  (course_rep / admin)
export const deleteTimetableEntry = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const existing = await prisma.timetableEntry.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Entry not found' });

  const { isAdmin, assigns } = await getScope(userId);
  const allowed = assigns.some(
    (a) => a.departmentId === existing.departmentId && a.level === existing.level
  );
  if (!isAdmin && !allowed) {
    return res.status(403).json({ message: 'You can only delete your own timetable' });
  }

  await prisma.timetableEntry.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Entry deleted' });
});