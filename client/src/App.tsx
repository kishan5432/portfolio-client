import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/lib/seo';
import { AuthProvider } from '@/contexts/AuthContext';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { AdminRoutes } from '@/routes/AdminRoutes';

// Import all page components
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { CertificatesPage } from '@/pages/CertificatesPage';
import { TimelinePage } from '@/pages/TimelinePage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { ApiTestPage } from '@/pages/ApiTestPage';


// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundProvider>
        <AuthProvider>
          {/* Default SEO */}
          <SEO />

          {isAdminRoute ? (
            // Admin routes don't use the main layout
            <Routes>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
          ) : (
            // Public routes use the main layout
            <Layout>
              <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/certificates" element={<CertificatesPage />} />
                  <Route path="/timeline" element={<TimelinePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/api-test" element={<ApiTestPage />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AnimatePresence>
            </Layout>
          )}
        </AuthProvider>
      </BackgroundProvider>
    </QueryClientProvider>
  );
}

export default App;
