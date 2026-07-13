import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Program from '../models/Program';
import auth, { AuthRequest } from '../middleware/auth';
import { logAudit } from '../middleware/auditLog';

const router = Router();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatProgram(program: any) {
  const data = typeof program.toObject === 'function' ? program.toObject() : program;
  return {
    ...data,
    slug: data.slug || slugify(data.title || ''),
    longDescription: data.longDescription || '',
    icon: data.icon || 'FaGraduationCap',
    features: Array.isArray(data.features) ? data.features : [],
    active: data.active ?? true,
  };
}

// GET /api/programs - Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined;

    if (!wantsPagination) {
      const programs = await Program.find().sort({ order: 1 });
      res.json(programs.map(formatProgram));
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const hasImageValue = { $exists: true, $nin: ['', null] };

    const [programs, total, active, inactive, featured, withImages] = await Promise.all([
      Program.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      Program.countDocuments(),
      Program.countDocuments({ active: { $ne: false } }),
      Program.countDocuments({ active: false }),
      Program.countDocuments({ featured: true }),
      Program.countDocuments({ image: hasImageValue }),
    ]);

    res.json({
      programs: programs.map(formatProgram),
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
        featured,
        withImages,
      },
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/programs/:id - Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }
    res.json(formatProgram(program));
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/programs - Protected
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const program = new Program(req.body);
      await program.save();

      if ((req as AuthRequest).user) {
        const authReq = req as AuthRequest;
        await logAudit({
          userId: authReq.user!.id,
          userName: authReq.user!.email,
          action: 'create',
          resource: 'program',
          resourceId: String(program._id),
          description: `Created program '${program.title}'`,
          ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
        });
      }

      res.status(201).json(formatProgram(program));
    } catch (error) {
      console.error('Create program error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/programs/:id - Protected
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    if ((req as AuthRequest).user) {
      const authReq = req as AuthRequest;
      await logAudit({
        userId: authReq.user!.id,
        userName: authReq.user!.email,
        action: 'update',
        resource: 'program',
        resourceId: String(req.params.id),
        description: `Updated program '${program.title}'`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });
    }

    res.json(formatProgram(program));
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/programs/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      res.status(404).json({ message: 'Program not found' });
      return;
    }

    if ((req as AuthRequest).user) {
      const authReq = req as AuthRequest;
      await logAudit({
        userId: authReq.user!.id,
        userName: authReq.user!.email,
        action: 'delete',
        resource: 'program',
        resourceId: String(req.params.id),
        description: `Deleted program '${program.title}'`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });
    }

    res.json({ message: 'Program deleted' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
