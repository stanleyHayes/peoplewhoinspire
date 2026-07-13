import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post';
import auth, { AuthRequest } from '../middleware/auth';
import { logAudit } from '../middleware/auditLog';

const router = Router();

// Helper to generate slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// GET /api/posts - Public (only published), supports pagination
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    const token = req.header('Authorization');
    if (!token) {
      filter.published = true;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 0;

    if (page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const [posts, total] = await Promise.all([
        Post.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments(filter),
      ]);
      res.json({ posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } else {
      const posts = await Post.find(filter).sort({ publishedAt: -1, createdAt: -1 });
      res.json(posts);
    }
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:slug - Public
router.get('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts - Protected
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, ...rest } = req.body;
      let slug = rest.slug || generateSlug(title);

      // Ensure unique slug
      const existing = await Post.findOne({ slug });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const post = new Post({ title, slug, ...rest });
      await post.save();

      if (req.user) {
        await logAudit({
          userId: req.user.id,
          userName: req.user.email,
          action: 'create',
          resource: 'post',
          resourceId: String(post._id),
          description: `Created blog post '${title}'`,
          ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
        });
      }

      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/posts/:id - Protected
router.put('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.body.title && !req.body.slug) {
      req.body.slug = generateSlug(req.body.title);
    }
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (req.user) {
      await logAudit({
        userId: req.user.id,
        userName: req.user.email,
        action: 'update',
        resource: 'post',
        resourceId: String(req.params.id),
        description: `Updated blog post '${post.title}'`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });
    }

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id - Protected
router.delete('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (req.user) {
      await logAudit({
        userId: req.user.id,
        userName: req.user.email,
        action: 'delete',
        resource: 'post',
        resourceId: String(req.params.id),
        description: `Deleted blog post '${post.title}'`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });
    }

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
