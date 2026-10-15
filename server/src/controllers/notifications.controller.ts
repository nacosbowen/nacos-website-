import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../index';
import { NotificationAudience, NotificationCategory } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendPush } from '../lib/push';

const ONE_TIME_LIFETIME_MS = 12 * 60 * 60 * 1000; // one-time notices last 12 hours

// audience values look like 'all' / 'level_200'; socket rooms look like 'level:all' / 'level:200'
const roomFor = (audience: string) =>
  audience === 'all' ? 'level:all' : audience.replace('level_', 'level:');

// Normal notifications are always visible. One-time ones are visible until they expire.
const visibleNow = () => ({
  OR: [
    { oneTime: false },
    { oneTime: true, popupExpiresAt: { gt: new Date() } },
  ],
});

// Removes expired one-time notifications. Normal notifications are never touched,
// because for them popupExpiresAt is only the popup display window.
export async function deleteExpiredOneTime() {
  const { count } = await prisma.notification.deleteMany({
    where: {
      oneTime: true,
      OR: [{ popupExpiresAt: null }, { popupExpiresAt: { lt: new Date() } }],
    },
  });
  return count;
}

// GET /api/notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const levelAudience = `level_${user.level}` as NotificationAudience;

  const notifications = await prisma.notification.findMany({
    where: {
      audience: { in: ['all', levelAudience] },
      ...visibleNow(),
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
    where: { audience: { in: ['all', levelAudience] }, ...visibleNow() },
  });

  const read = await prisma.notificationRead.count({
    where: {
      userId,
      notification: { audience: { in: ['all', levelAudience] }, ...visibleNow() },
    },
  });

  return res.json({ count: total - read });
});

// GET /api/notifications/popup  (old single-popup endpoint, kept for compatibility)
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
      // one-time notices disappear once this student has seen them
      NOT: { oneTime: true, reads: { some: { userId } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return res.json(popups);
});

// POST /api/notifications  (exec/admin)
export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, body, audience, category, popupDays, oneTime } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  // One-time notices live for 12 hours. Everything else pops up for popupDays days (default 1).
  const days = Number(popupDays) > 0 ? Number(popupDays) : 1;
  const popupExpiresAt = oneTime
    ? new Date(Date.now() + ONE_TIME_LIFETIME_MS)
    : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const notification = await prisma.notification.create({
    data: {
      title,
      body,
      audience: audience ?? 'all',
      category: category ?? 'general',
      createdById: userId,
      isPopup: !oneTime,
      popupExpiresAt,
      oneTime: !!oneTime,
    },
  });

  // Emit real-time to the matching socket room (one-time notices included)
  io.to(roomFor(audience ?? 'all')).emit('notification:new', notification);

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
      const dead = await sendPush(
        subs,
        {
          title,
          body: text.length > 140 ? text.slice(0, 137) + '...' : text,
          url: `/dashboard/student/notifications?highlight=${notification.id}`,
        },
        // one-time notices: drop the push if undelivered after 12 hours
        oneTime ? { ttl: ONE_TIME_LIFETIME_MS / 1000 } : {}
      );
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
      ...visibleNow(),
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

// GET /api/notifications/sent  (exec/admin) — every live notification, visible to all executives
export const getSentNotifications = asyncHandler(async (_req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: visibleNow(),
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return res.json(notifications);
});

// DELETE /api/notifications/:id  (any executive or admin)
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  await prisma.notification.delete({ where: { id: req.params.id } });

  // Tell open student pages to drop it immediately
  io.to('level:all').emit('notification:delete', { id: notification.id });

  return res.json({ message: 'Notification deleted' });
});

// PATCH /api/notifications/:id  (any executive or admin)
export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, audience, category, isPopup, popupDays } = req.body;

  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ message: 'Title and body are required' });
  }
  if (audience !== undefined && !Object.values(NotificationAudience).includes(audience)) {
    return res.status(400).json({ message: 'Invalid audience' });
  }
  if (category !== undefined && !Object.values(NotificationCategory).includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  // One-time notices keep their fixed 12-hour lifetime, so popup settings are ignored for them.
  const popupData: { isPopup?: boolean; popupExpiresAt?: Date } = {};
  if (!notification.oneTime) {
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