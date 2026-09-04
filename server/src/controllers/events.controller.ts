import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { io } from '../index';
import { asyncHandler } from '../utils/asyncHandler';

// GET /api/events
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: { _count: { select: { rsvps: true } } },
  });
  return res.json(events);
});

// GET /api/events/:id
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { rsvps: true } } },
  });
  if (!event) return res.status(404).json({ message: 'Event not found' });
  return res.json(event);
});

// POST /api/events
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, date, location, price, spots, category } = req.body;
  const userId = (req as any).userId;

  if (!title || !date) {
    return res.status(400).json({ message: 'Title and date are required' });
  }

  const event = await prisma.event.create({
    data: {
      title, description, date: new Date(date), location, createdById: userId,
      price: price !== undefined ? Number(price) : 0,
      spots: spots !== undefined ? Number(spots) : 0,
      category: category || 'Other',
    },
  });

  io.to('level:all').emit('event:new', event);
  return res.status(201).json(event);
});

// PATCH /api/events/:id
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, date, location, price, spots, category } = req.body;

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(date && { date: new Date(date) }),
      ...(location !== undefined && { location }),
      ...(price !== undefined && { price: Number(price) }),
      ...(spots !== undefined && { spots: Number(spots) }),
      ...(category !== undefined && { category }),
    },
  });
  return res.json(event);
});

// DELETE /api/events/:id
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  return res.json({ message: 'Event deleted' });
});

// POST /api/events/:id/rsvp
export const rsvpEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.id;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const existing = await prisma.eventRsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) return res.status(400).json({ message: 'Already RSVP\'d to this event' });

  const rsvp = await prisma.eventRsvp.create({
    data: { userId, eventId },
  });
  return res.status(201).json(rsvp);
});

// DELETE /api/events/:id/rsvp
export const cancelRsvp = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.id;

  const existing = await prisma.eventRsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (!existing) return res.status(404).json({ message: 'RSVP not found' });

  await prisma.eventRsvp.delete({ where: { userId_eventId: { userId, eventId } } });
  return res.json({ message: 'RSVP cancelled' });
});

// GET /api/events/:id/rsvp/me
export const getMyRsvp = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const eventId = req.params.id;

  const rsvp = await prisma.eventRsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  return res.json({ rsvped: !!rsvp, rsvp: rsvp || null });
});

// GET /api/events/:id/rsvps  (executive/admin)
export const getEventRsvps = asyncHandler(async (req: Request, res: Response) => {
  const rsvps = await prisma.eventRsvp.findMany({
    where: { eventId: req.params.id },
    include: {
      user: { select: { fullName: true, matricNumber: true, level: true, email: true } },
    },
    orderBy: { rsvpAt: 'asc' },
  });
  return res.json(rsvps);
});

// POST /api/events/:id/image  (executive/admin)
export const uploadEventImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ message: 'Image file is required' });

  const imageUrl = `/uploads/events/${file.filename}`;

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: { imageUrl },
  });

  return res.json(event);
});