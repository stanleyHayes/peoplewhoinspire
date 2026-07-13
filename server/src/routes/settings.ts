import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Setting from '../models/Setting';
import auth, { AuthRequest, requireRole } from '../middleware/auth';
import { logAudit } from '../middleware/auditLog';

const router = Router();

// GET /api/settings/public - Public-safe settings (no auth, no secrets)
// Exposes only CMS-editable site content: page image overrides (`siteImages`)
// and the social profile URLs (the whole `social` group is public by nature).
// NOTE: must be declared before '/:key' so 'public' isn't treated as a key.
router.get('/public', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await Setting.find({
      $or: [{ group: 'social' }, { key: 'siteImages' }],
    });

    const payload: { siteImages?: any; social: Record<string, any> } = { social: {} };
    for (const setting of settings) {
      if (setting.key === 'siteImages') {
        payload.siteImages = setting.value;
      } else {
        payload.social[setting.key] = setting.value;
      }
    }

    res.json(payload);
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings - Get all settings, grouped (protected — may contain email/secrets)
router.get('/', auth, requireRole('admin', 'superadmin'), async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await Setting.find().sort({ group: 1, key: 1 });

    // Group settings by their group field
    const grouped: Record<string, Record<string, any>> = {};
    for (const setting of settings) {
      if (!grouped[setting.group]) {
        grouped[setting.group] = {};
      }
      grouped[setting.group][setting.key] = setting.value;
    }

    res.json(grouped);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/settings/:key - Get single setting by key (protected)
router.get('/:key', auth, requireRole('admin', 'superadmin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      res.status(404).json({ message: 'Setting not found' });
      return;
    }
    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings - Bulk update settings (protected, admin+superadmin only)
router.put(
  '/',
  auth,
  requireRole('admin', 'superadmin'),
  [
    body().isArray().withMessage('Body must be an array of settings'),
    body('*.key').notEmpty().withMessage('Each setting must have a key'),
    body('*.value').exists().withMessage('Each setting must have a value'),
    body('*.group')
      .isIn(['general', 'seo', 'social', 'email', 'appearance'])
      .withMessage('Invalid group'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const settings: Array<{ key: string; value: any; group: string }> = req.body;

      for (const setting of settings) {
        await Setting.findOneAndUpdate(
          { key: setting.key },
          { $set: { value: setting.value, group: setting.group } },
          { upsert: true, new: true }
        );
      }

      const updatedSettings = await Setting.find().sort({ group: 1, key: 1 });
      const grouped: Record<string, Record<string, any>> = {};
      for (const setting of updatedSettings) {
        if (!grouped[setting.group]) {
          grouped[setting.group] = {};
        }
        grouped[setting.group][setting.key] = setting.value;
      }

      if (req.user) {
        await logAudit({
          userId: req.user.id,
          userName: req.user.email,
          action: 'settings_update',
          resource: 'settings',
          description: `Bulk updated ${settings.length} settings`,
          metadata: { keys: settings.map((s: { key: string }) => s.key) },
          ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
        });
      }

      res.json(grouped);
    } catch (error) {
      console.error('Bulk update settings error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/settings/:key - Update single setting (protected, admin+superadmin only)
router.put(
  '/:key',
  auth,
  requireRole('admin', 'superadmin'),
  [
    body('value').exists().withMessage('Value is required'),
    body('group')
      .optional()
      .isIn(['general', 'seo', 'social', 'email', 'appearance'])
      .withMessage('Invalid group'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const key = req.params.key as string;
      const { value, group } = req.body;

      const updateData: Record<string, any> = { value };
      if (group) updateData.group = group;

      const setting = await Setting.findOneAndUpdate(
        { key },
        { $set: updateData },
        { new: true, upsert: true }
      );

      if (req.user) {
        await logAudit({
          userId: req.user.id,
          userName: req.user.email,
          action: 'settings_update',
          resource: 'settings',
          resourceId: key,
          description: `Updated setting '${key}'`,
          ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
        });
      }

      res.json(setting);
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
