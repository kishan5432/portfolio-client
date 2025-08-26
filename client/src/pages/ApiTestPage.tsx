import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  useProjects,
  useCertificates,
  useTimelineItems,
  useSkills,
  useContactMessages,
  useCreateContactMessage,
  useLogin,
  useLogout,
  useVerifyToken
} from '@/lib/queries';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
}

function DataSection({ title, data, isLoading, error }: {
  title: string;
  data: any;
  isLoading: boolean;
  error: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {title}
      </h3>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Error occurred:</p>
          <p className="text-sm mt-1">{error.message}</p>
          <p className="text-xs mt-2 opacity-75">
            {error.message.includes('Failed to fetch')
              ? 'Server is not running or not accessible'
              : 'API returned an error'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            ✅ API Connected - {data?.data?.length || 0} items loaded
          </p>

          {data?.data?.slice(0, 2).map((item: any, index: number) => (
            <div
              key={item._id || index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                {item.title || item.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const createMessage = useCreateContactMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      createMessage.mutate(formData, {
        onSuccess: () => {
          setFormData({ name: '', email: '', message: '' });
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Test Contact Form (Optimistic Updates)
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <textarea
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full p-2 border rounded h-24 dark:bg-gray-700 dark:border-gray-600"
        />
        <Button
          type="submit"
          disabled={createMessage.isPending}
          className="w-full"
        >
          {createMessage.isPending ? 'Sending...' : 'Send Message'}
        </Button>
      </form>

      {createMessage.isError && (
        <p className="text-red-600 text-sm mt-2">
          Error: {createMessage.error?.message}
        </p>
      )}
      {createMessage.isSuccess && (
        <p className="text-green-600 text-sm mt-2">
          ✅ Message sent successfully!
        </p>
      )}
    </motion.div>
  );
}

function AuthTest() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const login = useLogin();
  const logout = useLogout();
  const { data: tokenData, isLoading: verifying } = useVerifyToken();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      login.mutate(credentials);
    }
  };

  const isAuthenticated = tokenData?.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Authentication Test
      </h3>

      {verifying ? (
        <p className="text-blue-600">Verifying token...</p>
      ) : isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-green-600">✅ Authenticated</p>
          <Button onClick={() => logout.mutate()} disabled={logout.isPending}>
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? 'Logging in...' : 'Login'}
          </Button>

          {login.isError && (
            <p className="text-red-600 text-sm">
              Error: {login.error?.message}
            </p>
          )}
        </form>
      )}
    </motion.div>
  );
}

export function ApiTestPage() {
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: certificates, isLoading: certificatesLoading, error: certificatesError } = useCertificates();
  const { data: timeline, isLoading: timelineLoading, error: timelineError } = useTimelineItems();
  const { data: skills, isLoading: skillsLoading, error: skillsError } = useSkills();
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useContactMessages();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Client-Server Integration Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Testing real API connections with TanStack Query and optimistic updates.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            API URL: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{apiUrl}</code>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DataSection
            title="Projects API"
            data={projects}
            isLoading={projectsLoading}
            error={projectsError}
          />

          <DataSection
            title="Certificates API"
            data={certificates}
            isLoading={certificatesLoading}
            error={certificatesError}
          />

          <DataSection
            title="Timeline API"
            data={timeline}
            isLoading={timelineLoading}
            error={timelineError}
          />

          <DataSection
            title="Skills API"
            data={skills}
            isLoading={skillsLoading}
            error={skillsError}
          />

          <DataSection
            title="Messages API"
            data={messages}
            isLoading={messagesLoading}
            error={messagesError}
          />

          <AuthTest />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContactForm />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6"
          >
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Integration Features:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Environment-based API URL configuration</li>
              <li>• TanStack Query with real API endpoints</li>
              <li>• Optimistic updates for better UX</li>
              <li>• JWT authentication flow</li>
              <li>• Error handling and loading states</li>
              <li>• Automatic cache invalidation</li>
            </ul>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
