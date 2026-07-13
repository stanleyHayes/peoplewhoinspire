import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import TeamMember from '../models/TeamMember';
import auth from '../middleware/auth';

const router = Router();

function formatMember(member: any) {
  const data = typeof member.toObject === 'function' ? member.toObject() : member;
  return {
    ...data,
    active: data.active ?? true,
    linkedin: data.linkedin || data.socialLinks?.linkedin || '',
    twitter: data.twitter || data.socialLinks?.twitter || '',
  };
}

function normalizeMemberPayload(body: any) {
  const { linkedin, twitter, socialLinks, ...rest } = body;
  return {
    ...rest,
    active: body.active ?? true,
    socialLinks: {
      ...(socialLinks || {}),
      linkedin: linkedin ?? socialLinks?.linkedin ?? '',
      twitter: twitter ?? socialLinks?.twitter ?? '',
    },
  };
}

// GET /api/team - Public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wantsPagination =
      req.query.page !== undefined ||
      req.query.limit !== undefined;

    if (!wantsPagination) {
      const members = await TeamMember.find().sort({ order: 1 });
      res.json(members.map(formatMember));
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [members, total, active, inactive] = await Promise.all([
      TeamMember.find().sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      TeamMember.countDocuments(),
      TeamMember.countDocuments({ active: { $ne: false } }),
      TeamMember.countDocuments({ active: false }),
    ]);

    res.json({
      members: members.map(formatMember),
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
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/team/:id - Public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }
    res.json(formatMember(member));
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/team - Protected
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('role').trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const member = new TeamMember(normalizeMemberPayload(req.body));
      await member.save();
      res.status(201).json(formatMember(member));
    } catch (error) {
      console.error('Create team member error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/team/:id - Protected
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      normalizeMemberPayload(req.body),
      { new: true }
    );
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }
    res.json(formatMember(member));
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/team/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      res.status(404).json({ message: 'Team member not found' });
      return;
    }
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
