import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SiteContentProvider } from './context/SiteContentContext';
import ScrollToTop from './components/motion/ScrollToTop';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Conversations from './pages/Conversations';
import Guests from './pages/Guests';
import Founder from './pages/Founder';
import Fellowship from './pages/Fellowship';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

// Admin pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManagePosts from './pages/admin/ManagePosts';
import ManagePrograms from './pages/admin/ManagePrograms';
import ManageTeam from './pages/admin/ManageTeam';
import ManageEvents from './pages/admin/ManageEvents';
import ManageSiteContent from './pages/admin/ManageSiteContent';
import ManagePartners from './pages/admin/ManagePartners';
import ManageTestimonials from './pages/admin/ManageTestimonials';
import ManageSubscribers from './pages/admin/ManageSubscribers';
import ManageContacts from './pages/admin/ManageContacts';
import ManageUsers from './pages/admin/ManageUsers';
import Settings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <SiteContentProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#d4a843', secondary: '#1a1a2e' },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="founder" element={<Founder />} />
            <Route path="about/emmanuel-mbansi" element={<Founder />} />
            <Route path="programs" element={<Programs />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="our-guests" element={<Guests />} />
            <Route path="conversations/gallery" element={<Guests />} />
            <Route path="fellowship" element={<Fellowship />} />
            <Route path="events" element={<Events />} />
            <Route path="contact" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Login (no layout) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="posts" element={<ManagePosts />} />
            <Route path="programs" element={<ManagePrograms />} />
            <Route path="team" element={<ManageTeam />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="site-content" element={<ManageSiteContent />} />
            <Route path="partners" element={<ManagePartners />} />
            <Route path="testimonials" element={<ManageTestimonials />} />
            <Route path="subscribers" element={<ManageSubscribers />} />
            <Route path="contacts" element={<ManageContacts />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </SiteContentProvider>
    </AuthProvider>
  );
}
