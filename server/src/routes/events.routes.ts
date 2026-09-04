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
import { uploadEventImage as uploadEventImageMiddleware } from '../middleware/upload.middleware';
import { uploadEventImage } from '../controllers/events.controller'; // add to existing import



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
router.post('/:id/image', requireRole('executive', 'admin'), uploadEventImageMiddleware.single('file'), uploadEventImage);

export default router;
