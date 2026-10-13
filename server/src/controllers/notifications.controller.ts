import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../index';
import { NotificationAudience, NotificationCategory } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendPush } from '../lib/push';

// GET /api/notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
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
});

// GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
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
});

// GET /api/notifications/popup
export const getActivePopup = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.json(null);

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const popup = await prisma.notification.findFirst({
    where: {
      isPopup: true,
      audience: { in: ['all', levelAudience] },
      popupExpiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(popup);
});

// POST /api/notifications  (exec/admin)
export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, body, audience, category, isPopup, popupDays } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  const shouldPopup = !!isPopup;
  const days = Number(popupDays) > 0 ? Number(popupDays) : 1;
  const popupExpiresAt = shouldPopup
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    : null;

  const notification = await prisma.notification.create({
    data: {
      title,
      body,
      audience: audience ?? 'all',
      category: category ?? 'general',
      createdById: userId,
      isPopup: shouldPopup,
      popupExpiresAt,
    },
  });

  // Emit real-time to appropriate rooms
  const targetRoom = audience && audience !== 'all' ? audience : 'level_all';
  io.to(targetRoom).emit('notification:new', notification);

    // Phone push: runs in the background and never blocks or breaks the broadcast
  (async () => {
    try {
      const level =
        audience && audience !== 'all'
          ? Number(String(audience).replace('level_', ''))
          : null;

      const subs = await prisma.pushSubscription.findMany({
        where: {
          userId: { not: userId },
          ...(level ? { user: { level } } : {}),
        },
        select: { endpoint: true, p256dh: true, auth: true },
      });
   
if (subs.length === 0) return;

      const text = String(body);
      const dead = await sendPush(subs, {
        title,
        body: text.length > 140 ? text.slice(0, 137) + '...' : text,
        url: '/dashboard/student/notifications',
      });


      if (dead.length) {
        await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: dead } } });
      }
    } catch (err) {
      console.error('Push broadcast failed:', err);
    }
  })();

  return res.status(201).json(notification);
});

// PATCH /api/notifications/:id/read
export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const notificationId = req.params.id;

  await prisma.notificationRead.upsert({
    where: { userId_notificationId: { userId, notificationId } },
    create: { userId, notificationId },
    update: {},
  });

  return res.json({ message: 'Marked as read' });
});

// PATCH /api/notifications/read-all
export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
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
});

// GET /api/notifications/popups  — every active popup for this user
export const getActivePopups = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.json([]);

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const popups = await prisma.notification.findMany({
    where: {
      isPopup: true,
      audience: { in: ['all', levelAudience] },
      popupExpiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return res.json(popups);
});

// GET /api/notifications/sent  (exec/admin) — what this executive sent; admin sees all
export const getSentNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  const isAdmin = me?.roles.some((ur) => ur.role.name === 'admin') ?? false;

  const notifications = await prisma.notification.findMany({
    where: isAdmin ? {} : { createdById: userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return res.json(notifications);
});

// DELETE /api/notifications/:id  (the sender, or an admin)
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  const isAdmin = me?.roles.some((ur) => ur.role.name === 'admin') ?? false;

  if (notification.createdById !== userId && !isAdmin) {
    return res.status(403).json({ message: 'You can only delete notifications you sent' });
  }

  await prisma.notification.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Notification deleted' });
});

// PATCH /api/notifications/:id  (the sender, or an admin)
export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
const { title, body, audience, category, isPopup, popupDays } = req.body;

  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  const isAdmin = me?.roles.some((ur) => ur.role.name === 'admin') ?? false;

  if (notification.createdById !== userId && !isAdmin) {
    return res.status(403).json({ message: 'You can only edit notifications you sent' });
  }

  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ message: 'Title and body are required' });
  }
  if (audience !== undefined && !Object.values(NotificationAudience).includes(audience)) {
    return res.status(400).json({ message: 'Invalid audience' });
  }
  if (category !== undefined && !Object.values(NotificationCategory).includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

const popupData: { isPopup?: boolean; popupExpiresAt?: Date } = {};
if (isPopup === false) {
  // Turning off keeps the old expiry date, so turning it back on can restore it.
  popupData.isPopup = false;
} else if (isPopup === true) {
  const days = Number(popupDays);
  if (days > 0) {
    popupData.isPopup = true;
    popupData.popupExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  } else if (notification.popupExpiresAt && notification.popupExpiresAt > new Date()) {
    popupData.isPopup = true; // expiry still in the future, so keep it unchanged
  } else {
    return res.status(400).json({ message: 'Number of days is required to enable the popup' });
  }
}

const updated = await prisma.notification.update({
  where: { id: req.params.id },
  data: {
    title: title.trim(),
    body: body.trim(),
    ...(audience !== undefined && { audience }),
    ...(category !== undefined && { category }),
    ...popupData,
  },
});

  return res.json(updated);
});