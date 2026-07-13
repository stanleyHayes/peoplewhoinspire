import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import Program from './models/Program';
import TeamMember from './models/TeamMember';
import Post from './models/Post';
import Event from './models/Event';
import Partner from './models/Partner';
import Testimonial from './models/Testimonial';
import Setting from './models/Setting';
import Contact from './models/Contact';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pwi';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Program.deleteMany({}),
      TeamMember.deleteMany({}),
      Post.deleteMany({}),
      Event.deleteMany({}),
      Partner.deleteMany({}),
      Testimonial.deleteMany({}),
      Setting.deleteMany({}),
      Contact.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create default superadmin user
    const admin = new User({
      email: 'admin@peoplewhoinspire.global',
      password: 'admin123',
      name: 'Admin',
      role: 'superadmin',
      status: 'active',
    });
    await admin.save();
    console.log('Created superadmin user: admin@peoplewhoinspire.global / admin123');

    // Additional users
    const editor = new User({
      email: 'editor@peoplewhoinspire.global',
      password: 'editor123',
      name: 'Sarah Mensah',
      role: 'editor',
      status: 'active',
    });
    await editor.save();

    const viewer = new User({
      email: 'viewer@peoplewhoinspire.global',
      password: 'viewer123',
      name: 'James Okafor',
      role: 'viewer',
      status: 'active',
    });
    await viewer.save();

    const invited = new User({
      email: 'invited@peoplewhoinspire.global',
      password: 'temp12345',
      name: 'Amina Diallo',
      role: 'editor',
      status: 'invited',
    });
    await invited.save();
    console.log('Created additional users');

    // Default settings
    const defaultSettings = [
      // General
      { key: 'siteName', value: 'People Who Inspire', group: 'general' },
      { key: 'siteDescription', value: 'Global leadership and impact platform', group: 'general' },
      { key: 'siteUrl', value: 'https://www.peoplewhoinspire.global', group: 'general' },
      { key: 'contactEmail', value: 'info@peoplewhoinspire.global', group: 'general' },
      { key: 'founderName', value: 'Emmanuel Mbansi', group: 'general' },
      // Social — standardized handle (feedback §7). Update URLs once confirmed.
      { key: 'twitter', value: '@peoplewhoinspire', group: 'social' },
      { key: 'instagram', value: '@peoplewhoinspire_global', group: 'social' },
      { key: 'linkedin', value: '', group: 'social' },
      { key: 'youtube', value: '', group: 'social' },
      { key: 'facebook', value: '', group: 'social' },
      { key: 'whatsapp', value: '+233 26 441 7040', group: 'social' },
      // SEO
      { key: 'metaTitle', value: 'People Who Inspire - Global Leadership Platform', group: 'seo' },
      { key: 'metaDescription', value: 'PWI is a global leadership and impact platform...', group: 'seo' },
      { key: 'ogImage', value: '', group: 'seo' },
      // Appearance
      { key: 'primaryColor', value: '#1a1a2e', group: 'appearance' },
      { key: 'accentColor', value: '#d4a843', group: 'appearance' },
      { key: 'logo', value: '', group: 'appearance' },
      { key: 'favicon', value: '', group: 'appearance' },
    ];
    await Setting.insertMany(defaultSettings);
    console.log('Created default settings');

    // Sample programs
    await Program.insertMany([
      {
        title: 'Leadership Development',
        description: 'Empowering the next generation of leaders through mentorship, workshops, and hands-on experience.',
        category: 'Education',
        featured: true,
        order: 1,
      },
      {
        title: 'Community Outreach',
        description: 'Building stronger communities through volunteer programs and local partnerships.',
        category: 'Community',
        featured: true,
        order: 2,
      },
      {
        title: 'Youth Empowerment',
        description: 'Providing young people with the tools and resources they need to succeed.',
        category: 'Youth',
        featured: false,
        order: 3,
      },
    ]);
    console.log('Created sample programs');

    // Sample team members
    await TeamMember.insertMany([
      {
        name: 'Jane Doe',
        role: 'Executive Director',
        bio: 'Jane has over 15 years of experience in nonprofit leadership and community development.',
        socialLinks: { linkedin: 'https://linkedin.com', twitter: 'https://twitter.com' },
        order: 1,
      },
      {
        name: 'John Smith',
        role: 'Program Director',
        bio: 'John leads our program initiatives and partnerships with a passion for social impact.',
        socialLinks: { linkedin: 'https://linkedin.com' },
        order: 2,
      },
    ]);
    console.log('Created sample team members');

    // Sample posts
    await Post.insertMany([
      {
        title: 'Welcome to People Who Inspire',
        slug: 'welcome-to-people-who-inspire',
        content: 'We are excited to launch our new platform dedicated to celebrating and supporting people who make a difference in their communities.',
        excerpt: 'Introducing our new platform for inspiration and impact.',
        author: 'Admin',
        category: 'News',
        tags: ['launch', 'announcement'],
        published: true,
        publishedAt: new Date(),
      },
      {
        title: 'The Power of Community',
        slug: 'the-power-of-community',
        content: 'Communities are the backbone of society. In this article, we explore how strong communities create lasting positive change.',
        excerpt: 'How strong communities create lasting positive change.',
        author: 'Admin',
        category: 'Insights',
        tags: ['community', 'impact'],
        published: true,
        publishedAt: new Date(),
      },
    ]);
    console.log('Created sample posts');

    // PWI Conversations — Saturday 7PM GMT live sessions (feedback §3.1 / §4.6).
    // PLACEHOLDER DATA: replace titles/speakers/recordingLink with the real session list,
    // or manage them via /admin/events. recordingLink should be the per-episode YouTube URL.
    // TODO: confirm the real PWI YouTube channel + per-episode links.
    const YT_CHANNEL = 'https://www.youtube.com/@peoplewhoinspire';
    const DAY = 24 * 60 * 60 * 1000;
    await Event.insertMany([
      // Upcoming — the next Saturday live session
      {
        title: 'PWI Conversations — Live This Saturday',
        description:
          'Join our next intimate dialogue with a remarkable global leader, streamed live on YouTube. Bring your questions for the interactive Q&A.',
        date: new Date(Date.now() + 5 * DAY),
        location: 'Live on YouTube · 7PM GMT',
        type: 'virtual',
        registrationLink: YT_CHANNEL,
        featured: true,
        active: true,
      },
      // Past sessions — each links to its recording
      {
        title: 'PWI Conversations with Kafui Dey',
        description: 'A conversation on media, communications, and purposeful storytelling in Africa.',
        date: new Date(Date.now() - 7 * DAY),
        location: 'Live on YouTube · 7PM GMT',
        type: 'virtual',
        recordingLink: YT_CHANNEL, // TODO: per-episode link
        featured: false,
        active: true,
      },
      {
        title: 'PWI Conversations with Rev. Edwin Dadson',
        description: 'An international musician on faith, creativity, and leading with purpose.',
        date: new Date(Date.now() - 14 * DAY),
        location: 'Live on YouTube · 7PM GMT',
        type: 'virtual',
        recordingLink: YT_CHANNEL, // TODO: per-episode link
        featured: false,
        active: true,
      },
      {
        title: 'PWI Conversations with Jacob Walker',
        description: 'An educational musician and global affairs director on impact across borders.',
        date: new Date(Date.now() - 21 * DAY),
        location: 'Live on YouTube · 7PM GMT',
        type: 'virtual',
        recordingLink: YT_CHANNEL, // TODO: per-episode link
        featured: false,
        active: true,
      },
      {
        title: 'PWI Conversations with Guy Bertrand',
        description: 'An award-winning Cameroon expert on continental leadership and identity.',
        date: new Date(Date.now() - 28 * DAY),
        location: 'Live on YouTube · 7PM GMT',
        type: 'virtual',
        recordingLink: YT_CHANNEL, // TODO: per-episode link
        featured: false,
        active: true,
      },
    ]);
    console.log('Created PWI Conversations sessions (placeholder — update with real data)');

    // Sample partners
    await Partner.insertMany([
      {
        name: 'Tony Blair Institute',
        description: 'Global organization working to support governments in delivering change for their people, with a focus on leadership development and governance.',
        website: 'https://institute.global',
        featured: true,
        order: 1,
      },
      {
        name: 'African Leadership Academy',
        description: 'Identifying, developing, and connecting the next generation of African leaders committed to transforming the continent.',
        website: 'https://africanleadershipacademy.org',
        featured: true,
        order: 2,
      },
      {
        name: 'Mandela Washington Fellowship',
        description: 'The flagship program of the Young African Leaders Initiative (YALI), empowering young African leaders through academic and leadership training in the U.S.',
        website: 'https://yali.state.gov',
        featured: true,
        order: 3,
      },
      {
        name: 'Global Shapers Community',
        description: 'A network of inspiring young people under the age of 30 working together to address local, regional, and global challenges.',
        website: 'https://globalshapers.org',
        featured: true,
        order: 4,
      },
      {
        name: 'Ashoka Foundation',
        description: 'The world\'s largest network of social entrepreneurs, driving systemic change across communities and industries worldwide.',
        website: 'https://ashoka.org',
        featured: true,
        order: 5,
      },
      {
        name: 'United Nations Youth Envoy',
        description: 'Advocating for the needs and rights of young people at the global level, promoting youth participation in peace and development.',
        website: 'https://un.org/youthenvoy',
        featured: false,
        order: 6,
      },
    ]);
    console.log('Created sample partners');

    // Testimonials — intentionally EMPTY (feedback §3.3).
    // Fake testimonials harm credibility; the homepage section hides itself until real
    // testimonials are added via /admin/testimonials.
    console.log('Skipped testimonials seed (add real ones via the admin CMS)');

    // Sample contact messages
    await Contact.insertMany([
      {
        name: 'Chioma Adeyemi',
        email: 'chioma@example.com',
        subject: 'Partnership Inquiry',
        message: 'Hello PWI team! I represent a youth-focused NGO in Lagos and we would love to explore partnership opportunities with People Who Inspire. We run leadership bootcamps for university students and believe there is strong alignment with your mission. Can we schedule a call?',
        read: false,
        replied: false,
      },
      {
        name: 'James Osei',
        email: 'james.osei@example.com',
        subject: 'Speaker Application for PWI Conversations',
        message: 'I am a social entrepreneur and TEDx speaker based in Accra. I would love to be featured on your PWI Conversations series to share my journey building a fintech platform that serves rural communities across West Africa. Please let me know the application process.',
        read: true,
        replied: true,
      },
      {
        name: 'Fatima Bello',
        email: 'fatima.b@example.com',
        subject: 'Mentorship Program Application',
        message: 'Dear PWI, I am a final-year law student at the University of Ibadan and I am very interested in your Leadership & Mentorship program. I have been following your work on social media and the impact stories have been truly inspiring. How can I apply for the next cohort?',
        read: true,
        replied: false,
      },
      {
        name: 'Daniel Mensah',
        email: 'daniel.m@example.com',
        subject: 'Volunteering Opportunities',
        message: 'Hi there, I am a software developer based in Nairobi and I would love to volunteer my technical skills to support PWI\'s mission. I can help with web development, app building, or data analysis. Are there any ongoing projects where I could contribute?',
        read: false,
        replied: false,
      },
    ]);
    console.log('Created sample contacts');

    // Sample subscribers
    const Subscriber = (await import('./models/Subscriber')).default;
    await Subscriber.deleteMany({});
    await Subscriber.insertMany([
      { email: 'kwame@example.com', name: 'Kwame Asante', subscribed: true },
      { email: 'amina@example.com', name: 'Amina Diallo', subscribed: true },
      { email: 'chen.wei@example.com', name: 'Chen Wei', subscribed: true },
      { email: 'sarah.j@example.com', name: 'Sarah Johnson', subscribed: false },
      { email: 'omar.hassan@example.com', name: 'Omar Hassan', subscribed: true },
    ]);
    console.log('Created sample subscribers');

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
