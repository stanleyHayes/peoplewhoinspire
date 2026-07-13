import { Router, Response } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Post from '../models/Post';
import Program from '../models/Program';
import TeamMember from '../models/TeamMember';
import Event from '../models/Event';
import Partner from '../models/Partner';
import Testimonial from '../models/Testimonial';
import Subscriber from '../models/Subscriber';
import Contact from '../models/Contact';
import AuditLog from '../models/AuditLog';

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics (protected)
router.get('/stats', auth, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const hasImageValue = { $exists: true, $nin: ['', null] };

    const [
      posts,
      publishedPosts,
      draftPosts,
      featuredPosts,
      postsWithImages,
      programs,
      featuredPrograms,
      programsWithImages,
      team,
      teamWithImages,
      events,
      activeEvents,
      upcomingEvents,
      pastEvents,
      featuredEvents,
      eventsWithImages,
      partners,
      activePartners,
      featuredPartners,
      partnersWithLogos,
      testimonials,
      activeTestimonials,
      featuredTestimonials,
      testimonialsWithImages,
      subscribers,
      activeSubscribers,
      inactiveSubscribers,
      contacts,
      unreadContacts,
      repliedContacts,
      pendingContacts,
      recentPosts,
      recentEvents,
      recentContacts,
      recentAuditLogs,
      auditActionStats,
    ] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      Post.countDocuments({ published: false }),
      Post.countDocuments({ featured: true }),
      Post.countDocuments({ $or: [{ coverImage: hasImageValue }, { image: hasImageValue }] }),
      Program.countDocuments(),
      Program.countDocuments({ featured: true }),
      Program.countDocuments({ image: hasImageValue }),
      TeamMember.countDocuments(),
      TeamMember.countDocuments({ image: hasImageValue }),
      Event.countDocuments(),
      Event.countDocuments({ active: true }),
      Event.countDocuments({ active: true, date: { $gte: now } }),
      Event.countDocuments({ date: { $lt: now } }),
      Event.countDocuments({ featured: true }),
      Event.countDocuments({ image: hasImageValue }),
      Partner.countDocuments(),
      Partner.countDocuments({ active: true }),
      Partner.countDocuments({ featured: true }),
      Partner.countDocuments({ logo: hasImageValue }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ active: true }),
      Testimonial.countDocuments({ featured: true }),
      Testimonial.countDocuments({ image: hasImageValue }),
      Subscriber.countDocuments(),
      Subscriber.countDocuments({ subscribed: true }),
      Subscriber.countDocuments({ subscribed: false }),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
      Contact.countDocuments({ replied: true }),
      Contact.countDocuments({ replied: false }),
      Post.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title slug category published createdAt updatedAt')
        .lean(),
      Event.find()
        .sort({ date: 1 })
        .limit(5)
        .select('title date type location active featured createdAt')
        .lean(),
      Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject read replied createdAt')
        .lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('userName action resource description createdAt')
        .lean(),
      AuditLog.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const auditActions = auditActionStats.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      posts,
      programs,
      team,
      events,
      partners,
      testimonials,
      subscribers,
      contacts,
      content: {
        posts: {
          total: posts,
          published: publishedPosts,
          drafts: draftPosts,
          featured: featuredPosts,
          withImages: postsWithImages,
        },
        programs: {
          total: programs,
          featured: featuredPrograms,
          withImages: programsWithImages,
        },
        team: {
          total: team,
          withImages: teamWithImages,
        },
        events: {
          total: events,
          active: activeEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
          featured: featuredEvents,
          withImages: eventsWithImages,
        },
        partners: {
          total: partners,
          active: activePartners,
          featured: featuredPartners,
          withLogos: partnersWithLogos,
        },
        testimonials: {
          total: testimonials,
          active: activeTestimonials,
          featured: featuredTestimonials,
          withImages: testimonialsWithImages,
        },
        subscribers: {
          total: subscribers,
          subscribed: activeSubscribers,
          unsubscribed: inactiveSubscribers,
        },
        contacts: {
          total: contacts,
          unread: unreadContacts,
          replied: repliedContacts,
          pending: pendingContacts,
        },
      },
      recent: {
        posts: recentPosts,
        events: recentEvents,
        contacts: recentContacts,
        auditLogs: recentAuditLogs,
      },
      audit: {
        total30d: auditActionStats.reduce((sum, item) => sum + item.count, 0),
        actions: auditActions,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
