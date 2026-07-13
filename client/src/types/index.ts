export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'invited';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Setting {
  _id: string;
  key: string;
  value: string;
  group: 'general' | 'seo' | 'social' | 'email' | 'appearance';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  image?: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  icon: string;
  image?: string;
  features: string[];
  order: number;
  active: boolean;
  createdAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: 'in-person' | 'virtual' | 'hybrid';
  registrationLink?: string;
  recordingLink?: string;
  image?: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface Partner {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  organization: string;
  quote: string;
  image?: string;
  rating: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  createdAt: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  user: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  posts: number;
  programs: number;
  team: number;
  events: number;
  partners: number;
  testimonials: number;
  subscribers: number;
  contacts: number;
  content?: {
    posts: {
      total: number;
      published: number;
      drafts: number;
      featured: number;
      withImages: number;
    };
    programs: {
      total: number;
      featured: number;
      withImages: number;
    };
    team: {
      total: number;
      withImages: number;
    };
    events: {
      total: number;
      active: number;
      upcoming: number;
      past: number;
      featured: number;
      withImages: number;
    };
    partners: {
      total: number;
      active: number;
      featured: number;
      withLogos: number;
    };
    testimonials: {
      total: number;
      active: number;
      featured: number;
      withImages: number;
    };
    subscribers: {
      total: number;
      subscribed: number;
      unsubscribed: number;
    };
    contacts: {
      total: number;
      unread: number;
      replied: number;
      pending: number;
    };
  };
  recent?: {
    posts: Array<{
      _id: string;
      title: string;
      slug: string;
      category?: string;
      published: boolean;
      createdAt: string;
      updatedAt?: string;
    }>;
    events: Array<{
      _id: string;
      title: string;
      date: string;
      type?: 'in-person' | 'virtual' | 'hybrid';
      location?: string;
      active?: boolean;
      featured?: boolean;
      createdAt?: string;
    }>;
    contacts: Array<{
      _id: string;
      name: string;
      email: string;
      subject: string;
      read: boolean;
      replied: boolean;
      createdAt: string;
    }>;
    auditLogs: Array<{
      _id: string;
      userName: string;
      action: string;
      resource: string;
      description: string;
      createdAt: string;
    }>;
  };
  audit?: {
    total30d: number;
    actions: Record<string, number>;
  };
}
