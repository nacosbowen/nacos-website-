import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/users  (admin)
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { level, departmentId, role, search } = req.query;

  const users = await prisma.user.findMany({
    where: {
      ...(level && { level: Number(level) }),
      ...(departmentId && { departmentId: Number(departmentId) }),
      ...(role && { roles: { some: { role: { name: role as any } } } }),
      ...(search && {
        OR: [
          { fullName: { contains: search as string, mode: 'insensitive' } },
          { matricNumber: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      department: true,
      roles: { include: { role: true } },
    },
    orderBy: { fullName: 'asc' },
  });

  return res.json(
    users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      matricNumber: u.matricNumber,
      level: u.level,
      department: u.department,
      roles: u.roles.map((ur) => ur.role.name),
      createdAt: u.createdAt,
    })),
  );
});

// GET /api/users/:id
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const requesterId = (req as any).userId;
  const targetId = req.params.id === 'me' ? requesterId : req.params.id;

  // Block viewing other users' profiles unless requester is admin
  if (targetId !== requesterId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      include: { roles: { include: { role: true } } },
    });
    const isAdmin = requester?.roles.some((ur) => ur.role.name === 'admin');
    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    include: {
      department: true,
      roles: { include: { role: true } },
      courseRepAssigns: true,
    },
  });

  if (!user) return res.status(404).json({ message: 'User not found' });

  return res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    matricNumber: user.matricNumber,
    level: user.level,
    profilePictureUrl: user.profilePictureUrl,
    department: user.department,
    roles: user.roles.map((ur) => ur.role.name),
    courseRepLevel: user.courseRepAssigns[0]?.level ?? null,
    createdAt: user.createdAt,
  });
});

// PATCH /api/users/:id/roles  (admin)
export const assignRole = asyncHandler(async (req: Request, res: Response) => {
  const { role, action } = req.body; // action: 'add' | 'remove'

  if (!role || !['add', 'remove'].includes(action)) {
    return res.status(400).json({ message: 'role and action (add|remove) are required' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const roleRecord = await prisma.role.upsert({
    where: { name: role },
    create: { name: role },
    update: {},
  });

  if (action === 'add') {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roleRecord.id } },
      create: { userId: user.id, roleId: roleRecord.id },
      update: {},
    });
  } else {
    await prisma.userRole.deleteMany({
      where: { userId: user.id, roleId: roleRecord.id },
    });
  }

  return res.json({ message: `Role ${action === 'add' ? 'assigned' : 'removed'}` });
});

// GET /api/departments
export const getDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } });
  return res.json(departments);
});