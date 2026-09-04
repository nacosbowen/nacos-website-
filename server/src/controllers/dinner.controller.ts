import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

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

  return res.json(updated);
});

// POST /api/dinner/image  (admin / executive)
export const uploadDinnerImage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!file) return res.status(400).json({ message: 'Image file is required' });

  const imageUrl = `/uploads/dinner/${file.filename}`;
  const info = await getOrCreateDinnerInfo();

  const updated = await prisma.dinnerInfo.update({
    where: { id: info.id },
    data: { imageUrl, updatedById: userId },
  });

  return res.json(updated);
});