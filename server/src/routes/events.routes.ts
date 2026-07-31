import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
  getMyRsvp,
  getEventRsvps,
} from '../controllers/events.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', requireRole('executive', 'admin'), createEvent);
router.patch('/:id', requireRole('executive', 'admin'), updateEvent);
router.delete('/:id', requireRole('executive', 'admin'), deleteEvent);

router.post('/:id/rsvp', rsvpEvent);
router.delete('/:id/rsvp', cancelRsvp);
router.get('/:id/rsvp/me', getMyRsvp);
router.get('/:id/rsvps', requireRole('executive', 'admin'), getEventRsvps);

export default router;
