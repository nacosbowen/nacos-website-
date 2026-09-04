import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/polls
export const getPolls = asyncHandler(async (req: Request, res: Response) => {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });
  return res.json(polls);
});

// GET /api/polls/:id
export const getPoll = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id },
    include: {
      options: {
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });

  if (!poll) return res.status(404).json({ message: 'Poll not found' });

  const myVote = await prisma.vote.findUnique({
    where: { userId_pollId: { userId, pollId: poll.id } },
  });

  return res.json({ ...poll, myVote: myVote?.optionId ?? null });
});

// POST /api/polls  (exec/admin)
export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, description, options, endsAt } = req.body;

  if (!title || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: 'Title and at least 2 options are required' });
  }

  const poll = await prisma.poll.create({
    data: {
      title,
      description,
      createdById: userId,
      endsAt: endsAt ? new Date(endsAt) : null,
      options: {
        create: options.map((text: string) => ({ text })),
      },
    },
    include: { options: true },
  });

  return res.status(201).json(poll);
});

// POST /api/polls/:id/vote
export const castVote = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const pollId = req.params.id;
  const { optionId } = req.body;

  if (!optionId) return res.status(400).json({ message: 'optionId is required' });

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true },
  });

  if (!poll) return res.status(404).json({ message: 'Poll not found' });
  if (!poll.isActive) return res.status(400).json({ message: 'This poll is closed' });
  if (poll.endsAt && poll.endsAt < new Date()) {
    return res.status(400).json({ message: 'This poll has ended' });
  }

  const validOption = poll.options.find((o) => o.id === optionId);
  if (!validOption) return res.status(400).json({ message: 'Invalid option' });

  const existing = await prisma.vote.findUnique({
    where: { userId_pollId: { userId, pollId } },
  });
  if (existing) return res.status(400).json({ message: 'You have already voted on this poll' });

  const vote = await prisma.vote.create({
    data: { userId, pollId, optionId },
  });

  return res.status(201).json(vote);
});

// PATCH /api/polls/:id  (exec/admin — close/reopen)
export const updatePoll = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, title, description, endsAt } = req.body;

  const poll = await prisma.poll.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
    },
  });
  return res.json(poll);
});

// DELETE /api/polls/:id  (admin)
export const deletePoll = asyncHandler(async (req: Request, res: Response) => {
  await prisma.poll.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Poll deleted' });
});