import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { AboutPage } from '@/pages/admin/AboutPage';
import { ProjectsPage } from '@/pages/admin/ProjectsPage';
import { CertificatesPage } from '@/pages/admin/CertificatesPage';
import { TimelinePage } from '@/pages/admin/TimelinePage';
import { SkillsPage } from '@/pages/admin/SkillsPage';
import { UploadManagerPage } from '@/pages/admin/UploadManagerPage';
import { ContactMessagesPage } from '@/pages/admin/ContactMessagesPage';

export function AdminRoutes() {
  return (
    <Routes>
      {/* Login page - not protected */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="uploads" element={<UploadManagerPage />} />
        <Route path="messages" element={<ContactMessagesPage />} />
      </Route>
    </Routes>
  );
}
