import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Subscriber from '../models/Subscriber';
import auth from '../middleware/auth';

const router = Router();

// POST /api/subscribers - Public (subscribe)
router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').optional().trim(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, name } = req.body;

      const existing = await Subscriber.findOne({ email });
      if (existing) {
        res.status(400).json({ message: 'Email already subscribed' });
        return;
      }

      const subscriber = new Subscriber({ email, name: name || '' });
      await subscriber.save();
      res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
      console.error('Subscribe error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/subscribers - Protected (list all)
router.get('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.search !== undefined ||
      req.query.status !== undefined;

    if (!wantsPagination) {
      const subscribers = await Subscriber.find().sort({ createdAt: -1 });
      res.json(subscribers);
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active' || status === 'subscribed' || status === 'true') {
      filter.subscribed = true;
    }

    if (status === 'unsubscribed' || status === 'inactive' || status === 'false') {
      filter.subscribed = false;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      subscribers,
      total,
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers,
      recentSubscribers,
    ] = await Promise.all([
      Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Subscriber.countDocuments(filter),
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ subscribed: true }),
      Subscriber.countDocuments({ subscribed: false }),
      Subscriber.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers,
        recent30Days: recentSubscribers,
      },
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/subscribers/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      res.status(404).json({ message: 'Subscriber not found' });
      return;
    }
    res.json({ message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
