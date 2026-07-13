import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import auth, { AuthRequest, requireRole } from '../middleware/auth';
import { logAudit } from '../middleware/auditLog';

const router = Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      if (user.status === 'inactive') {
        res.status(403).json({ message: 'Account is inactive. Contact an administrator.' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }

      // Update lastLogin timestamp
      user.lastLogin = new Date();
      await user.save();

      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        jwtSecret,
        { expiresIn: '7d' }
      );

      await logAudit({
        userId: String(user._id),
        userName: user.name,
        action: 'login',
        resource: 'auth',
        description: `${user.name} logged in`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/me - Get current user (protected)
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/profile - Update current user's profile (protected)
router.put(
  '/profile',
  auth,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('avatar').optional().isString(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, avatar } = req.body;
      const updateData: Record<string, any> = {};

      if (name !== undefined) updateData.name = name;
      if (avatar !== undefined) updateData.avatar = avatar;

      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/auth/password - Change password (protected)
router.put(
  '/password',
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user?.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }

      user.password = newPassword;
      await user.save();

      await logAudit({
        userId: req.user!.id,
        userName: user.name,
        action: 'password_change',
        resource: 'auth',
        description: `${user.name} changed their password`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/users - List all users (protected, admin+superadmin only)
router.get(
  '/users',
  auth,
  requireRole('admin', 'superadmin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const wantsPagination =
        req.query.page !== undefined ||
        req.query.limit !== undefined ||
        req.query.search !== undefined ||
        req.query.role !== undefined ||
        req.query.status !== undefined;

      if (!wantsPagination) {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
        return;
      }

      const page = Math.max(parseInt(req.query.page as string) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
      const skip = (page - 1) * limit;

      const filter: Record<string, any> = {};
      const search = (req.query.search as string)?.trim();
      const role = (req.query.role as string)?.trim();
      const status = (req.query.status as string)?.trim();

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) {
        filter.role = role;
      }

      if (status) {
        filter.status = status;
      }

      const [
        users,
        total,
        totalUsers,
        activeUsers,
        invitedUsers,
        inactiveUsers,
        superadmins,
        admins,
        editors,
        viewers,
      ] = await Promise.all([
        User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        User.countDocuments({ status: 'invited' }),
        User.countDocuments({ status: 'inactive' }),
        User.countDocuments({ role: 'superadmin' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ role: 'editor' }),
        User.countDocuments({ role: 'viewer' }),
      ]);

      res.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          total: totalUsers,
          active: activeUsers,
          invited: invitedUsers,
          inactive: inactiveUsers,
          roles: {
            superadmin: superadmins,
            admin: admins,
            editor: editors,
            viewer: viewers,
          },
        },
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/users/invite - Invite a new user (protected, admin+superadmin only)
router.post(
  '/users/invite',
  auth,
  requireRole('admin', 'superadmin'),
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['superadmin', 'admin', 'editor', 'viewer']).withMessage('Invalid role'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { email, name, role } = req.body;

      // Only superadmin can invite admins or superadmins
      if (['admin', 'superadmin'].includes(role) && req.user?.role !== 'superadmin') {
        res.status(403).json({ message: 'Only superadmins can invite admin or superadmin users' });
        return;
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      }

      // Generate a random temporary password
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const inviteToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        email,
        password: tempPassword,
        name,
        role,
        status: 'invited',
        invitedBy: req.user?.id,
        inviteToken,
        inviteExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      await user.save();

      await logAudit({
        userId: req.user!.id,
        userName: req.user!.email,
        action: 'invite',
        resource: 'user',
        resourceId: String(user._id),
        description: `Invited ${name} (${email}) as ${role}`,
        metadata: { email, role },
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.status(201).json({
        message: 'User invited successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/auth/users/:id - Update a user (protected, admin+superadmin only)
router.put(
  '/users/:id',
  auth,
  requireRole('admin', 'superadmin'),
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('role').optional().isIn(['superadmin', 'admin', 'editor', 'viewer']).withMessage('Invalid role'),
    body('status').optional().isIn(['active', 'inactive', 'invited']).withMessage('Invalid status'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const { name, role, status } = req.body;

      const targetUser = await User.findById(id);
      if (!targetUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Can't modify own role
      if (req.user?.id === id && role && role !== targetUser.role) {
        res.status(403).json({ message: 'You cannot change your own role' });
        return;
      }

      // Superadmin cannot be demoted by admin
      if (targetUser.role === 'superadmin' && req.user?.role !== 'superadmin') {
        res.status(403).json({ message: 'Only superadmins can modify superadmin users' });
        return;
      }

      // Only superadmin can assign admin/superadmin roles
      if (role && ['admin', 'superadmin'].includes(role) && req.user?.role !== 'superadmin') {
        res.status(403).json({ message: 'Only superadmins can assign admin or superadmin roles' });
        return;
      }

      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (status !== undefined) updateData.status = status;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).select('-password');

      await logAudit({
        userId: req.user!.id,
        userName: req.user!.email,
        action: 'update',
        resource: 'user',
        resourceId: String(id),
        description: `Updated user '${targetUser.name}'`,
        metadata: updateData,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/auth/users/:id - Delete a user (protected, superadmin only)
router.delete(
  '/users/:id',
  auth,
  requireRole('superadmin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Can't delete yourself
      if (req.user?.id === id) {
        res.status(403).json({ message: 'You cannot delete your own account' });
        return;
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      await logAudit({
        userId: req.user!.id,
        userName: req.user!.email,
        action: 'delete',
        resource: 'user',
        resourceId: String(id),
        description: `Deleted user '${user.name}' (${user.email})`,
        metadata: { email: user.email, role: user.role },
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/auth/users/:id/reset-password - Reset a user's password (protected, admin+superadmin only)
router.put(
  '/users/:id/reset-password',
  auth,
  requireRole('admin', 'superadmin'),
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Admin cannot reset superadmin password
      if (user.role === 'superadmin' && req.user?.role !== 'superadmin') {
        res.status(403).json({ message: 'Only superadmins can reset superadmin passwords' });
        return;
      }

      user.password = newPassword;
      await user.save();

      await logAudit({
        userId: req.user!.id,
        userName: req.user!.email,
        action: 'password_change',
        resource: 'user',
        resourceId: String(id),
        description: `Reset password for user '${user.name}'`,
        ipAddress: Array.isArray(req.ip) ? req.ip[0] : req.ip,
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
