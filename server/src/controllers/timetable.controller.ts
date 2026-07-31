import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/timetable?departmentId=&level=
export const getTimetable = async (req: Request, res: Response) => {
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
};

// POST /api/timetable  (course_rep / admin)
export const createTimetableEntry = async (req: Request, res: Response) => {
  const { departmentId, level, courseCode, courseTitle, day, startTime, endTime, venue } = req.body;

  if (!departmentId || !level || !courseCode || !courseTitle || !day || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' });
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
};

// PATCH /api/timetable/:id  (course_rep / admin)
export const updateTimetableEntry = async (req: Request, res: Response) => {
  const { courseCode, courseTitle, day, startTime, endTime, venue } = req.body;

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
};

// DELETE /api/timetable/:id  (course_rep / admin)
export const deleteTimetableEntry = async (req: Request, res: Response) => {
  await prisma.timetableEntry.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Entry deleted' });
};
