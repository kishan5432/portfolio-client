import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import { AboutFormData } from './schemas';

// Query keys
export const aboutQueryKeys = {
  about: ['about'] as const,
  aboutAll: ['about', 'all'] as const,
  aboutItem: (id: string) => ['about', id] as const,
};

// About
export function useAbout() {
  return useQuery({
    queryKey: aboutQueryKeys.about,
    queryFn: () => apiClient.get('/about'),
  });
}

export function useAboutAll() {
  return useQuery({
    queryKey: aboutQueryKeys.aboutAll,
    queryFn: () => apiClient.get('/about/all'),
  });
}

export function useAboutItem(id: string) {
  return useQuery({
    queryKey: aboutQueryKeys.aboutItem(id),
    queryFn: () => apiClient.get(`/about/${id}`),
    enabled: !!id,
  });
}

export function useCreateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AboutFormData, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post('/about', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.about });
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.aboutAll });
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<AboutFormData>) =>
      apiClient.put(`/about/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.about });
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.aboutAll });
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.aboutItem(variables.id) });
    },
  });
}

export function useDeleteAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/about/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.about });
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.aboutAll });
    },
  });
}

export function useActivateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.put(`/about/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.about });
      queryClient.invalidateQueries({ queryKey: aboutQueryKeys.aboutAll });
    },
  });
}
