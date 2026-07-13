import { Router, Response } from 'express';
import AuditLog from '../models/AuditLog';
import auth, { AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs — List audit logs (admin+superadmin only)
router.get(
  '/',
  auth,
  requireRole('admin', 'superadmin', 'editor'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};

      if (req.query.action) {
        filter.action = req.query.action;
      }
      if (req.query.resource) {
        filter.resource = req.query.resource;
      }
      if (req.query.userId) {
        filter.user = req.query.userId;
      }

      const [logs, total] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments(filter),
      ]);

      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/audit-logs/stats — Action counts for the last 30 days
router.get(
  '/stats',
  auth,
  requireRole('admin', 'superadmin', 'editor'),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const stats = await AuditLog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const result: Record<string, number> = {};
      for (const stat of stats) {
        result[stat._id] = stat.count;
      }

      res.json(result);
    } catch (error) {
      console.error('Get audit log stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
