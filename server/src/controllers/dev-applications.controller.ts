import { Request, Response } from 'express';
import { Prisma, DevApplicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { logActivity } from '../lib/activity';

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'UI/UX Designer', 'DevOps Engineer', 'Data Analyst', 'Other'];
const LEVELS = ['100L', '200L', '300L', '400L', '500L'];

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

// Only http(s) links are accepted, so a "javascript:" link can never be rendered as a clickable href
function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// POST /api/dev-applications  (any logged-in user)
export const createDevApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const b = req.body ?? {};

  const data = {
    name: str(b.name),
    email: str(b.email),
    dept: str(b.dept),
    level: str(b.level),
    role: str(b.role),
    skills: str(b.skills),
    portfolio: str(b.portfolio),
    motivation: str(b.motivation),
  };

  const errors: Record<string, string> = {};
  if (!data.name) errors.name = 'Full name is required';
  else if (data.name.length > 100) errors.name = 'Name is too long';
  if (!data.email) errors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(data.email) || data.email.length > 150) errors.email = 'Please enter a valid email';
  if (!data.dept) errors.dept = 'Department is required';
  else if (data.dept.length > 100) errors.dept = 'Department is too long';
  if (!LEVELS.includes(data.level)) errors.level = 'Please select a valid level';
  if (!ROLES.includes(data.role)) errors.role = 'Please select a valid role';
  if (!data.skills) errors.skills = 'Please list at least one skill';
  else if (data.skills.length > 300) errors.skills = 'Skills are too long';
  if (!data.portfolio) errors.portfolio = 'GitHub or portfolio link is required';
  else if (data.portfolio.length > 300 || !isHttpUrl(data.portfolio)) errors.portfolio = 'Please enter a valid link starting with http:// or https://';
  if (!data.motivation) errors.motivation = 'Please tell us why you want to join';
  else if (data.motivation.length > 2000) errors.motivation = 'Motivation is too long (max 2000 characters)';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields', errors });
  }

  const existing = await prisma.devApplication.findUnique({ where: { userId } });

  if (existing && existing.status !== 'rejected') {
    return res.status(409).json({
      message: existing.status === 'accepted'
        ? 'Your application has already been accepted'
        : 'You have already submitted an application. It is still under review',
    });
  }

  // A rejected applicant can reapply: their old application is replaced and goes back to pending
  if (existing) {
    const result = await prisma.devApplication.updateMany({
      where: { id: existing.id, status: 'rejected' },
      data: { ...data, status: 'pending', createdAt: new Date() },
    });
    if (result.count === 0) {
      // Status changed between the check and the update (e.g. an executive reset it)
      return res.status(409).json({ message: 'You have already submitted an application' });
    }
    const updated = await prisma.devApplication.findUnique({ where: { id: existing.id } });
    return res.status(201).json(updated);
  }

  try {
    const application = await prisma.devApplication.create({ data: { ...data, userId } });
    return res.status(201).json(application);
  } catch (err) {
    // Two requests racing past the check above: the unique index on userId still catches it
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ message: 'You have already submitted an application' });
    }
    throw err;
  }
});

// GET /api/dev-applications  (exec/admin)
export const getDevApplications = asyncHandler(async (_req: Request, res: Response) => {
  const applications = await prisma.devApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  return res.json(applications);
});

// PATCH /api/dev-applications/:id/status  (exec/admin)
export const updateDevApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { status } = req.body ?? {};
  if (!Object.values(DevApplicationStatus).includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const existing = await prisma.devApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Application not found' });

  const updated = await prisma.devApplication.update({
    where: { id: req.params.id },
    data: { status },
  });

  const verb = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'reopened';
  await logActivity(userId, verb, 'dev application', `${existing.name} (${existing.role})`);

  return res.json(updated);
});

// DELETE /api/dev-applications/:id  (exec/admin)
export const deleteDevApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const existing = await prisma.devApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: 'Application not found' });

  await prisma.devApplication.delete({ where: { id: req.params.id } });
  await logActivity(userId, 'deleted', 'dev application', `${existing.name} (${existing.role})`);

  return res.json({ message: 'Application deleted' });
});