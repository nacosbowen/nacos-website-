import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImageBuffer } from '../lib/cloudinary';
import { logActivity } from '../lib/activity';

// Ensures a DinnerInfo row always exists, returns it
async function getOrCreateDinnerInfo() {
  let info = await prisma.dinnerInfo.findFirst();
  if (!info) {
    info = await prisma.dinnerInfo.create({ data: {} }); // uses schema defaults
  }
  return info;
}

// GET /api/dinner
export const getDinnerInfo = asyncHandler(async (_req: Request, res: Response) => {
  const info = await getOrCreateDinnerInfo();
  return res.json(info);
});

// PATCH /api/dinner  (admin / executive)
export const updateDinnerInfo = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, date, time, venue, theme, dressCode, ticketPrice, highlights, imageUrl } = req.body;

  const info = await getOrCreateDinnerInfo();

  const updated = await prisma.dinnerInfo.update({
    where: { id: info.id },
    data: {
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date: date ? new Date(date) : null }),
      ...(time !== undefined && { time }),
      ...(venue !== undefined && { venue }),
      ...(theme !== undefined && { theme }),
      ...(dressCode !== undefined && { dressCode }),
      ...(ticketPrice !== undefined && { ticketPrice }),
      ...(highlights !== undefined && { highlights }),
      ...(imageUrl !== undefined && { imageUrl }),
      updatedById: userId,
    },
  });

  // Work out what the log entry should say
  const changed = Object.entries({ title, date, time, venue, theme, dressCode, ticketPrice, highlights })
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);

  if (imageUrl === null) {
    await logActivity(userId, 'removed', 'dinner', 'Removed the dinner image');
  }
  if (changed.length > 0) {
    await logActivity(userId, 'updated', 'dinner', `Changed: ${changed.join(', ')}`);
  }

  return res.json(updated);
});

// POST /api/dinner/image  (admin / executive)
export const uploadDinnerImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!file) return res.status(400).json({ message: 'Image file is required' });

  const imageUrl = await uploadImageBuffer(file.buffer, 'nacos/dinner');
  const info = await getOrCreateDinnerInfo();

  const updated = await prisma.dinnerInfo.update({
    where: { id: info.id },
    data: { imageUrl, updatedById: userId },
  });

  await logActivity(userId, 'updated', 'dinner', 'Uploaded a new dinner image');
  return res.json(updated);
});