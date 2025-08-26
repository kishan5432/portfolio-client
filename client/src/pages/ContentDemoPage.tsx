import { motion } from 'framer-motion';
import { useProjects, useCertificates, useTimelineItems, useSkills } from '@/lib/queries';
import { Container } from '@/components/shared/Container';

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
          Error: {error.message}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total items: {data?.data?.length || 0}
          </p>

          {data?.data?.slice(0, 3).map((item: any, index: number) => (
            <div
              key={item._id || index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {item.title || item.name}
              </div>
              {item.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {item.description}
                </div>
              )}
              {item.category && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {item.category}
                </div>
              )}
            </div>
          ))}

          {(data?.data?.length || 0) > 3 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              ... and {(data?.data?.length || 0) - 3} more items
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function ContentDemoPage() {
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: certificates, isLoading: certificatesLoading, error: certificatesError } = useCertificates();
  const { data: timeline, isLoading: timelineLoading, error: timelineError } = useTimelineItems();
  const { data: skills, isLoading: skillsLoading, error: skillsError } = useSkills();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Content Loading Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This page demonstrates the TanStack Query integration with local JSON fallback.
            Data will load from the API if available, or fall back to local JSON files.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataSection
            title="Projects"
            data={projects}
            isLoading={projectsLoading}
            error={projectsError}
          />

          <DataSection
            title="Certificates"
            data={certificates}
            isLoading={certificatesLoading}
            error={certificatesError}
          />

          <DataSection
            title="Timeline"
            data={timeline}
            isLoading={timelineLoading}
            error={timelineError}
          />

          <DataSection
            title="Skills"
            data={skills}
            isLoading={skillsLoading}
            error={skillsError}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How it works:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• TanStack Query first attempts to fetch from the API endpoints</li>
            <li>• If the API is unavailable, it automatically falls back to local JSON files</li>
            <li>• JSON files are located in <code>/public/content/</code></li>
            <li>• This ensures the app works even when the backend is not running</li>
          </ul>
        </motion.div>
      </Container>
    </div>
  );
}
