import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Testimonial from '../models/Testimonial';
import auth from '../middleware/auth';

const router = Router();

// GET /api/testimonials - Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined ||
      req.query.search !== undefined ||
      req.query.status !== undefined ||
      req.query.featured !== undefined ||
      req.query.rating !== undefined;

    if (!wantsPagination) {
      const testimonials = await Testimonial.find().sort({ order: 1 });
      res.json(testimonials);
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim();
    const status = (req.query.status as string)?.trim();
    const featured = (req.query.featured as string)?.trim();
    const rating = parseInt(req.query.rating as string);
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active' || status === 'true') {
      filter.active = true;
    }

    if (status === 'inactive' || status === 'false') {
      filter.active = false;
    }

    if (featured === 'featured' || featured === 'true') {
      filter.featured = true;
    }

    if (featured === 'standard' || featured === 'false') {
      filter.featured = false;
    }

    if (!Number.isNaN(rating) && rating >= 1 && rating <= 5) {
      filter.rating = rating;
    }

    const hasImageValue = { $exists: true, $nin: ['', null] };
    const [ratingStats] = await Testimonial.aggregate([
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ]);

    const [
      testimonials,
      total,
      totalTestimonials,
      activeTestimonials,
      inactiveTestimonials,
      featuredTestimonials,
      homepageReadyTestimonials,
      testimonialsWithImages,
    ] = await Promise.all([
      Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      Testimonial.countDocuments(filter),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ active: true }),
      Testimonial.countDocuments({ active: false }),
      Testimonial.countDocuments({ featured: true }),
      Testimonial.countDocuments({ active: true, featured: true }),
      Testimonial.countDocuments({ image: hasImageValue }),
    ]);

    res.json({
      testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        total: totalTestimonials,
        active: activeTestimonials,
        inactive: inactiveTestimonials,
        featured: featuredTestimonials,
        homepageReady: homepageReadyTestimonials,
        withImages: testimonialsWithImages,
        averageRating: Number((ratingStats?.averageRating || 0).toFixed(1)),
      },
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/testimonials/:id - Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/testimonials - Protected
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('quote').trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const testimonial = new Testimonial(req.body);
      await testimonial.save();
      res.status(201).json(testimonial);
    } catch (error) {
      console.error('Create testimonial error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/testimonials/:id - Protected
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/testimonials/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      res.status(404).json({ message: 'Testimonial not found' });
      return;
    }
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
