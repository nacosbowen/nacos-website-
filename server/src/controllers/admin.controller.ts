import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/admin/registry
export const getRegistry = async (req: Request, res: Response) => {
  const { search, level } = req.query;

  const entries = await prisma.studentRegistry.findMany({
    where: {
      ...(level && { level: Number(level) }),
      ...(search && {
        OR: [
          { fullName: { contains: search as string, mode: 'insensitive' } },
          { matricNumber: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: [{ level: 'asc' }, { fullName: 'asc' }],
  });

  return res.json(entries);
};

// POST /api/admin/registry  — add a single student to the registry
export const addToRegistry = async (req: Request, res: Response) => {
  const { fullName, matricNumber, level } = req.body;

  if (!fullName || !matricNumber || !level) {
    return res.status(400).json({ message: 'fullName, matricNumber, and level are required' });
  }

  const entry = await prisma.studentRegistry.upsert({
    where: { matricNumber: matricNumber.toUpperCase().trim() },
    create: {
      fullName: fullName.trim(),
      matricNumber: matricNumber.toUpperCase().trim(),
      level: Number(level),
    },
    update: {
      fullName: fullName.trim(),
      level: Number(level),
    },
  });

  return res.status(201).json(entry);
};

// POST /api/admin/registry/bulk  — import many students at once
export const bulkAddToRegistry = async (req: Request, res: Response) => {
  const { students } = req.body as {
    students: { fullName: string; matricNumber: string; level: number }[];
  };

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: 'students array is required' });
  }

  const data = students.map((s) => ({
    fullName: s.fullName.trim(),
    matricNumber: s.matricNumber.toUpperCase().trim(),
    level: Number(s.level),
  }));

  // Upsert all — safe to call multiple times
  let created = 0;
  let updated = 0;

  for (const student of data) {
    const existing = await prisma.studentRegistry.findUnique({
      where: { matricNumber: student.matricNumber },
    });

    if (existing) {
      await prisma.studentRegistry.update({
        where: { matricNumber: student.matricNumber },
        data: { fullName: student.fullName, level: student.level },
      });
      updated++;
    } else {
      await prisma.studentRegistry.create({ data: student });
      created++;
    }
  }

  return res.json({ message: `${created} added, ${updated} updated`, total: data.length });
};

// DELETE /api/admin/registry/:id
export const removeFromRegistry = async (req: Request, res: Response) => {
  await prisma.studentRegistry.delete({ where: { id: Number(req.params.id) } });
  return res.json({ message: 'Removed from registry' });
};

// GET /api/admin/stats
export const getStats = async (_req: Request, res: Response) => {
  const [totalStudents, totalRegistered, totalEvents, totalSuggestions, totalPolls] =
    await Promise.all([
      prisma.studentRegistry.count(),
      prisma.user.count(),
      prisma.event.count(),
      prisma.suggestion.count(),
      prisma.poll.count(),
    ]);

  const suggestionsByStatus = await prisma.suggestion.groupBy({
    by: ['status'],
    _count: true,
  });

  return res.json({
    totalStudents,
    totalRegistered,
    totalEvents,
    totalSuggestions,
    totalPolls,
    suggestionsByStatus: Object.fromEntries(
      suggestionsByStatus.map((s) => [s.status, s._count]),
    ),
  });
};
