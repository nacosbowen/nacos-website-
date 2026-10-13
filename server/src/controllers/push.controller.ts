import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/push/public-key
export const getPublicKey = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

// POST /api/push/subscribe
export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { endpoint, keys } = req.body || {};

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ message: 'Invalid subscription' });
    return;
  }

  // upsert so a phone that logs into a different account moves to that account
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth },
    create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
  });

  res.status(201).json({ ok: true });
});

// POST /api/push/unsubscribe
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { endpoint } = req.body || {};

  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
  }

  res.json({ ok: true });
});