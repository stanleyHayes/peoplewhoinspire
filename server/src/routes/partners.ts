import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Partner from '../models/Partner';
import auth from '../middleware/auth';

const router = Router();

// GET /api/partners - Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined;

    if (!wantsPagination) {
      const partners = await Partner.find().sort({ order: 1 });
      res.json(partners);
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [partners, total, active, inactive] = await Promise.all([
      Partner.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      Partner.countDocuments(),
      Partner.countDocuments({ active: true }),
      Partner.countDocuments({ active: false }),
    ]);

    res.json({
      partners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        total,
        active,
        inactive,
      },
    });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/partners/:id - Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      res.status(404).json({ message: 'Partner not found' });
      return;
    }
    res.json(partner);
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/partners - Protected
router.post(
  '/',
  auth,
  [body('name').trim().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const partner = new Partner(req.body);
      await partner.save();
      res.status(201).json(partner);
    } catch (error) {
      console.error('Create partner error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/partners/:id - Protected
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!partner) {
      res.status(404).json({ message: 'Partner not found' });
      return;
    }
    res.json(partner);
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/partners/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) {
      res.status(404).json({ message: 'Partner not found' });
      return;
    }
    res.json({ message: 'Partner deleted' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
