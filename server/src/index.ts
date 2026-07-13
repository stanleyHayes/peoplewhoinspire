import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db';

// Route imports
import authRoutes from './routes/auth';
import programRoutes from './routes/programs';
import teamRoutes from './routes/team';
import postRoutes from './routes/posts';
import eventRoutes from './routes/events';
import partnerRoutes from './routes/partners';
import testimonialRoutes from './routes/testimonials';
import subscriberRoutes from './routes/subscribers';
import contactRoutes from './routes/contact';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';
import dashboardRoutes from './routes/dashboard';
import auditLogRoutes from './routes/auditLogs';

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (skipped in the test environment — route tests run without a DB)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
const allowedOrigins = [
  "https://peoplewhoinspire.vercel.app",
  "https://www.peoplewhoinspire.global",
  "https://peoplewhoinspire.global",
  "http://localhost:3000",
  "http://localhost:5172",
  "http://localhost:5173",
  "http://localhost:5174",
  // Comma-separated extra origins for previews/staging, e.g. "https://pwi-preview.vercel.app"
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : []),
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server (skipped when imported by the test suite)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
