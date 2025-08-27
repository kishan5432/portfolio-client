import { useEffect, useState } from 'react';
import { Container } from '@/components/shared/Container';
import { useProjects, useCertificates, useTimelineItems } from '@/hooks/useDataFetching';

export function DebugPage() {
  const [apiTest, setApiTest] = useState<any>(null);
  const [directFetch, setDirectFetch] = useState<any>(null);

  const { data: projectsResponse, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: certificatesResponse, loading: certificatesLoading, error: certificatesError } = useCertificates();
  const { data: timelineResponse, loading: timelineLoading, error: timelineError } = useTimelineItems();

  // Test direct fetch to API
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🔍 Testing direct API call...');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const response = await fetch(`${apiBase}/projects`);
        console.log('📡 API Response status:', response.status);
        console.log('📡 API Response ok:', response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('📡 API Response data:', data);
          setDirectFetch(data);
        } else {
          console.error('❌ API Response error:', response.statusText);
          setDirectFetch({ error: `${response.status}: ${response.statusText}` });
        }
      } catch (error) {
        console.error('❌ Direct fetch error:', error);
        setDirectFetch({ error: error.message });
      }
    };

    testAPI();
  }, []);

  // Test API client
  useEffect(() => {
    const testAPIClient = async () => {
      try {
        console.log('🔍 Testing API client...');
        // Import the API client dynamically
        const { apiClient } = await import('@/lib/api');
        console.log('🔧 API Client base URL:', apiClient);

        const response = await apiClient.getProjects();
        console.log('🔧 API Client response:', response);
        setApiTest(response);
      } catch (error) {
        console.error('❌ API Client error:', error);
        setApiTest({ error: error.message });
      }
    };

    testAPIClient();
  }, []);

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <Container>
        <h1 className="text-3xl font-bold mb-8">API Debug Page</h1>

        <div className="space-y-8">
          {/* Direct Fetch Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Direct Fetch Test</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(directFetch, null, 2)}
            </pre>
          </div>

          {/* API Client Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Client Test</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>

          {/* Hook Tests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Projects Hook</h2>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {projectsLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {projectsError || 'None'}</p>
                <p><strong>Data count:</strong> {Array.isArray(projectsResponse?.data) ? projectsResponse.data.length : 'N/A'}</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(projectsResponse, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Certificates Hook</h2>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {certificatesLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {certificatesError || 'None'}</p>
                <p><strong>Data count:</strong> {Array.isArray(certificatesResponse?.data) ? certificatesResponse.data.length : 'N/A'}</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(certificatesResponse, null, 2)}
                </pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Timeline Hook</h2>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {timelineLoading ? 'Yes' : 'No'}</p>
                <p><strong>Error:</strong> {timelineError || 'None'}</p>
                <p><strong>Data count:</strong> {Array.isArray(timelineResponse?.data) ? timelineResponse.data.length : 'N/A'}</p>
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(timelineResponse, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
