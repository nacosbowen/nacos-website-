import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// POST /api/suggestions
export const createSuggestion = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { body, anonymous } = req.body;

  if (!body || body.trim().length < 10) {
    return res.status(400).json({ message: 'Suggestion must be at least 10 characters' });
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      userId,
      body: body.trim(),
      anonymous: Boolean(anonymous),
    },
  });
  return res.status(201).json(suggestion);
};

// GET /api/suggestions  (exec/admin: all; student: own)
export const getSuggestions = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });

  const userRoles = user?.roles.map((ur) => ur.role.name) ?? [];
  const isPrivileged = userRoles.includes('executive') || userRoles.includes('admin');

  const suggestions = await prisma.suggestion.findMany({
    where: isPrivileged ? {} : { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { fullName: true, matricNumber: true, level: true },
      },
    },
  });

  // Hide user info for anonymous suggestions (unless admin)
  const result = suggestions.map((s) => ({
    id: s.id,
    body: s.body,
    anonymous: s.anonymous,
    status: s.status,
    createdAt: s.createdAt,
    user: s.anonymous && !userRoles.includes('admin') ? null : s.user,
  }));

  return res.json(result);
};

// PATCH /api/suggestions/:id/status  (exec/admin)
export const updateSuggestionStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const suggestion = await prisma.suggestion.update({
    where: { id: req.params.id },
    data: { status },
  });
  return res.json(suggestion);
};
