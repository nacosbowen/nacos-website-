import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../index';
import { NotificationAudience, NotificationCategory } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { sendPush } from '../lib/push';
import { logActivity } from '../lib/activity';

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
// What this student may see: their level (or everyone), and their department (or untargeted)
const audienceFor = (user: { level: number; departmentId: number }) => ({
  audience: { in: ['all', `level_${user.level}`] as NotificationAudience[] },
  OR: [{ departmentId: null }, { departmentId: user.departmentId }],
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

  const notifications = await prisma.notification.findMany({
    where: { AND: [audienceFor(user), visibleNow()] },
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
  senderType: n.senderType,
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

  const total = await prisma.notification.count({
    where: { AND: [audienceFor(user), visibleNow()] },
  });

  const read = await prisma.notificationRead.count({
    where: {
      userId,
      notification: { AND: [audienceFor(user), visibleNow()] },
    },
  });

  return res.json({ count: total - read });
});

// GET /api/notifications/popup  (old single-popup endpoint, kept for compatibility)
export const getActivePopup = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.json(null);

  const popup = await prisma.notification.findFirst({
    where: {
      AND: [audienceFor(user)],
      isPopup: true,
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

  const popups = await prisma.notification.findMany({
    where: {
      AND: [audienceFor(user)],
      isPopup: true,
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

  await logActivity(
    userId,
    'sent',
    'notification',
    `"${notification.title}" to ${notification.audience === 'all' ? 'all levels' : notification.audience.replace('level_', '') + 'L'}`
  );

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

// POST /api/notifications/course-rep  (course reps only)
export const createCourseRepNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, body, category, popupDays, oneTime, departmentId, level } = req.body;

  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ message: 'Title and body are required' });
  }
  if (category !== undefined && !Object.values(NotificationCategory).includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  // The rep's class comes from the database, never from what the browser claims
  const assignments = await prisma.courseRepAssignment.findMany({ where: { userId } });
  if (assignments.length === 0) {
    return res.status(403).json({ message: 'You are not assigned as a course rep' });
  }

  let assignment;
  if (departmentId !== undefined && level !== undefined) {
    assignment = assignments.find(
      (a) => a.departmentId === Number(departmentId) && a.level === Number(level)
    );
    if (!assignment) {
      return res.status(403).json({ message: 'You can only send to your own class' });
    }
  } else if (assignments.length === 1) {
    assignment = assignments[0];
  } else {
    return res.status(400).json({ message: 'Choose which class this is for' });
  }

  const audience = `level_${assignment.level}`;
  if (!Object.values(NotificationAudience).includes(audience as NotificationAudience)) {
    return res.status(400).json({ message: 'Invalid class level' });
  }

  const days = Number(popupDays) > 0 ? Number(popupDays) : 1;
  const popupExpiresAt = oneTime
    ? new Date(Date.now() + ONE_TIME_LIFETIME_MS)
    : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const notification = await prisma.notification.create({
    data: {
      title: title.trim(),
      body: body.trim(),
      audience: audience as NotificationAudience,
      category: category ?? 'general',
      createdById: userId,
      isPopup: !oneTime,
      popupExpiresAt,
      oneTime: !!oneTime,
      departmentId: assignment.departmentId,
      senderType: 'course_rep',
    },
  });

  await logActivity(
    userId,
    'sent',
    'notification',
    `"${notification.title}" to ${assignment.level}L (department ${assignment.departmentId})`
  );

  // Live delivery: only students in this department and level
  io.to(`level:${assignment.level}:dept:${assignment.departmentId}`).emit(
    'notification:new',
    notification
  );

  // Phone push: same audience, in the background
  (async () => {
    try {
      const subs = await prisma.pushSubscription.findMany({
        where: {
          userId: { not: userId },
          user: { level: assignment.level, departmentId: assignment.departmentId },
        },
        select: { endpoint: true, p256dh: true, auth: true },
      });
      if (subs.length === 0) return;

      const text = String(notification.body);
      const dead = await sendPush(
        subs,
        {
          title: notification.title,
          body: text.length > 140 ? text.slice(0, 137) + '...' : text,
          url: `/dashboard/student/notifications?highlight=${notification.id}`,
        },
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

  const unread = await prisma.notification.findMany({
    where: {
      AND: [audienceFor(user), visibleNow()],
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
  const userId = (req as any).userId;

  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  await prisma.notification.delete({ where: { id: req.params.id } });

  await logActivity(userId, 'deleted', 'notification', `"${notification.title}"`);

  // Tell open student pages to drop it immediately
  io.to('level:all').emit('notification:delete', { id: notification.id });

  return res.json({ message: 'Notification deleted' });
});

// PATCH /api/notifications/:id  (any executive or admin)
export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
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

  await logActivity(userId, 'updated', 'notification', `"${updated.title}"`);

  return res.json(updated);
});
// GET /api/notifications/course-rep/classes  (course reps only)
export const getMyCourseRepClasses = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const assignments = await prisma.courseRepAssignment.findMany({
    where: { userId },
    include: { department: { select: { id: true, name: true, code: true } } },
    orderBy: { level: 'asc' },
  });

  return res.json(
    assignments.map((a) => ({
      departmentId: a.departmentId,
      level: a.level,
      department: a.department,
    }))
  );
});

// GET /api/notifications/course-rep/sent  (course reps only): only this rep's own notifications
export const getMyCourseRepSent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const notifications = await prisma.notification.findMany({
    where: { createdById: userId, senderType: 'course_rep', ...visibleNow() },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return res.json(notifications);
});

// DELETE /api/notifications/course-rep/:id  (course reps only): own notifications only
export const deleteMyCourseRepNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (
    !notification ||
    notification.createdById !== userId ||
    notification.senderType !== 'course_rep'
  ) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  await prisma.notification.delete({ where: { id: notification.id } });

  await logActivity(userId, 'deleted', 'notification', `"${notification.title}"`);

  // Tell open pages in this class to drop it right away
  const level = Number(notification.audience.replace('level_', ''));
  io.to(`level:${level}:dept:${notification.departmentId}`).emit('notification:delete', {
    id: notification.id,
  });

  return res.json({ message: 'Notification deleted' });
});