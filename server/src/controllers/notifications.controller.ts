import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../index';
import { NotificationAudience } from '@prisma/client';

// GET /api/notifications
export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const notifications = await prisma.notification.findMany({
    where: {
      audience: { in: ['all', levelAudience] },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      reads: { where: { userId } },
    },
  });

  const result = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    audience: n.audience,
    category: n.category,
    createdAt: n.createdAt,
    isRead: n.reads.length > 0,
  }));

  return res.json(result);
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.json({ count: 0 });

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const total = await prisma.notification.count({
    where: { audience: { in: ['all', levelAudience] } },
  });

  const read = await prisma.notificationRead.count({
    where: {
      userId,
      notification: { audience: { in: ['all', levelAudience] } },
    },
  });

  return res.json({ count: total - read });
};

// POST /api/notifications  (exec/admin)
export const createNotification = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, body, audience, category } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  const notification = await prisma.notification.create({
    data: {
      title,
      body,
      audience: audience ?? 'all',
      category: category ?? 'general',
      createdById: userId,
    },
  });

  // Emit real-time to appropriate rooms
  const targetRoom = audience && audience !== 'all' ? audience : 'level:all';
  io.to(targetRoom === 'level:all' ? 'level:all' : `level:${audience.replace('level_', '')}`).emit(
    'notification:new',
    notification,
  );

  return res.status(201).json(notification);
};

// PATCH /api/notifications/:id/read
export const markRead = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const notificationId = req.params.id;

  await prisma.notificationRead.upsert({
    where: { userId_notificationId: { userId, notificationId } },
    create: { userId, notificationId },
    update: {},
  });

  return res.json({ message: 'Marked as read' });
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const unread = await prisma.notification.findMany({
    where: {
      audience: { in: ['all', levelAudience] },
      reads: { none: { userId } },
    },
    select: { id: true },
  });

  if (unread.length > 0) {
    await prisma.notificationRead.createMany({
      data: unread.map((n) => ({ userId, notificationId: n.id })),
      skipDuplicates: true,
    });
  }

  return res.json({ marked: unread.length });
};
