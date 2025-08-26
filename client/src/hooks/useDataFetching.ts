import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface UseDataFetchingOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dependencies?: any[];
}

export function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  options: UseDataFetchingOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError, dependencies = [] } = options;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

// Specific hooks for each data type
export function useProjects(params?: { page?: number; limit?: number; featured?: boolean; tag?: string }) {
  return useDataFetching(
    () => apiClient.getProjects(params),
    [params?.page, params?.limit, params?.featured, params?.tag]
  );
}

export function useCertificates(params?: { page?: number; limit?: number; organization?: string; tag?: string }) {
  return useDataFetching(
    () => apiClient.getCertificates(params),
    [params?.page, params?.limit, params?.organization, params?.tag]
  );
}

export function useTimelineItems(params?: { page?: number; limit?: number }) {
  return useDataFetching(
    () => apiClient.getTimelineItems(params),
    [params?.page, params?.limit]
  );
}
