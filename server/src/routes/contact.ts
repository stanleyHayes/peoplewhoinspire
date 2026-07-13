import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Contact from '../models/Contact';
import auth from '../middleware/auth';

const router = Router();

// POST /api/contact - Public (submit contact form)
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('subject').trim().notEmpty(),
    body('message').trim().notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const contact = new Contact(req.body);
      await contact.save();
      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Contact submit error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/contact - Protected (list all messages)
router.get('/', auth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/contacts/:id - Protected (update message fields like read/replied)
router.put('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, any> = {};
    if (req.body.read !== undefined) updateData.read = req.body.read;
    if (req.body.replied !== undefined) updateData.replied = req.body.replied;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!contact) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/contact/:id - Protected
router.delete('/:id', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
