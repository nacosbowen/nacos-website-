import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/archive
export const getArchiveItems = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.archiveItem.findMany({
    include: { images: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(items);
});

// POST /api/archive  (executive/admin)
export const createArchiveItem = asyncHandler(async (req: Request, res: Response) => {
  const { title, type, year, category, description } = req.body;
  const userId = (req as any).userId;

  if (!title || !type || !year || !category) {
    return res.status(400).json({ message: 'title, type, year, and category are required' });
  }

  const item = await prisma.archiveItem.create({
    data: { title, type, year, category, description, createdById: userId },
    include: { images: true },
  });

  return res.status(201).json(item);
});

// DELETE /api/archive/:id  (executive/admin)
export const deleteArchiveItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.archiveItem.findUnique({
    where: { id: req.params.id },
    include: { images: true },
  });
  if (!item) return res.status(404).json({ message: 'Not found' });

  // Clean up image files from disk
  for (const img of item.images) {
    const filePath = path.join(__dirname, '../../', img.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await prisma.archiveItem.delete({ where: { id: req.params.id } }); // images cascade-delete
  return res.json({ message: 'Deleted' });
});

// POST /api/archive/:id/images  (executive/admin) — supports multiple files
export const addArchiveImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'At least one image file is required' });
  }

  const item = await prisma.archiveItem.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ message: 'Archive item not found' });

  const created = await prisma.$transaction(
    files.map((file) =>
      prisma.archiveImage.create({
        data: {
          archiveItemId: req.params.id,
          imageUrl: `/uploads/archive/${file.filename}`,
        },
      })
    )
  );

  return res.status(201).json(created);
});

// DELETE /api/archive/:itemId/images/:imageId  (executive/admin)
export const deleteArchiveImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await prisma.archiveImage.findUnique({ where: { id: req.params.imageId } });
  if (!image) return res.status(404).json({ message: 'Image not found' });

  const filePath = path.join(__dirname, '../../', image.imageUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.archiveImage.delete({ where: { id: req.params.imageId } });
  return res.json({ message: 'Image deleted' });
});