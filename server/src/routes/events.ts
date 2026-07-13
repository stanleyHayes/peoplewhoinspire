import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event';
import auth from '../middleware/auth';

const router = Router();

// GET /api/events - Public, supports pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.search !== undefined ||
      req.query.status !== undefined ||
      req.query.type !== undefined ||
      req.query.featured !== undefined ||
      req.query.timing !== undefined;

    if (!wantsPagination) {
      const events = await Event.find().sort({ date: -1 });
      res.json(events);
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const type = (req.query.type as string)?.trim();
    const featured = (req.query.featured as string)?.trim();
    const timing = (req.query.timing as string)?.trim();
    const now = new Date();
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active' || status === 'true') {
      filter.active = true;
    }

    if (status === 'inactive' || status === 'false') {
      filter.active = false;
    }

    if (type && ['virtual', 'in-person', 'hybrid'].includes(type)) {
      filter.type = type;
    }

    if (featured === 'featured' || featured === 'true') {
      filter.featured = true;
    }

    if (featured === 'standard' || featured === 'false') {
      filter.featured = false;
    }

    if (timing === 'upcoming') {
      filter.date = { $gte: now };
    }

    if (timing === 'past') {
      filter.date = { $lt: now };
    }

    const hasImageValue = { $exists: true, $nin: ['', null] };
    const [
      events,
      total,
      totalEvents,
      activeEvents,
      inactiveEvents,
      upcomingEvents,
      pastEvents,
      featuredEvents,
      eventsWithImages,
      virtualEvents,
      inPersonEvents,
      hybridEvents,
    ] = await Promise.all([
      Event.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
      Event.countDocuments(),
      Event.countDocuments({ active: true }),
      Event.countDocuments({ active: false }),
      Event.countDocuments({ date: { $gte: now } }),
      Event.countDocuments({ date: { $lt: now } }),
      Event.countDocuments({ featured: true }),
      Event.countDocuments({ image: hasImageValue }),
      Event.countDocuments({ type: 'virtual' }),
      Event.countDocuments({ type: 'in-person' }),
      Event.countDocuments({ type: 'hybrid' }),
    ]);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        total: totalEvents,
        active: activeEvents,
        inactive: inactiveEvents,
        upcoming: upcomingEvents,
        past: pastEvents,
        featured: featuredEvents,
        withImages: eventsWithImages,
        types: {
          virtual: virtualEvents,
          inPerson: inPersonEvents,
          hybrid: hybridEvents,
        },
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/events/:id - Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/events - Protected
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('date').isISO8601(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const event = new Event(req.body);
      await event.save();
      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/events/:id - Protected
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/events/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
