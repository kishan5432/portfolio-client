import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  ProjectFormData,
  CertificateFormData,
  TimelineItemFormData,
  SkillFormData,
  ContactMessageData,
  AboutFormData
} from './schemas';

// Query keys
export const queryKeys = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  certificates: ['certificates'] as const,
  certificate: (id: string) => ['certificates', id] as const,
  timeline: ['timeline'] as const,
  timelineItem: (id: string) => ['timeline', id] as const,
  skills: ['skills'] as const,
  skill: (id: string) => ['skills', id] as const,
  contactMessages: ['contact-messages'] as const,
  contactMessage: (id: string) => ['contact-messages', id] as const,
  about: ['about'] as const,
  aboutAll: ['about', 'all'] as const,
  aboutItem: (id: string) => ['about', id] as const,
};

// Projects
export function useProjects(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...queryKeys.projects, params],
    queryFn: () => apiClient.get('/projects', params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => apiClient.get(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<ProjectFormData, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post('/projects', data),
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects });

      const previousProjects = queryClient.getQueryData(queryKeys.projects);

      queryClient.setQueryData(queryKeys.projects, (old: any) => {
        if (!old?.data) return old;

        const optimisticProject = {
          _id: `temp-${Date.now()}`,
          ...newProject,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: old.data.length,
        };

        return {
          ...old,
          data: [...old.data, optimisticProject],
        };
      });

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects, context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ProjectFormData>) =>
      apiClient.put(`/projects/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(variables.id) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/projects/${id}`),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects });

      const previousProjects = queryClient.getQueryData(queryKeys.projects);

      queryClient.setQueryData(queryKeys.projects, (old: any) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.filter((project: any) => project._id !== deletedId),
        };
      });

      return { previousProjects };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects, context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projects: { _id: string; order: number }[]) =>
      Promise.all(projects.map(p => apiClient.put(`/projects/${p._id}`, { order: p.order }))),
    onMutate: async (newProjects) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(queryKeys.projects);

      // Optimistically update
      queryClient.setQueryData(queryKeys.projects, (old: any) => {
        if (!old?.data) return old;

        const updatedData = [...old.data].sort((a, b) => {
          const aOrder = newProjects.find(p => p._id === a._id)?.order ?? a.order;
          const bOrder = newProjects.find(p => p._id === b._id)?.order ?? b.order;
          return aOrder - bOrder;
        });

        return { ...old, data: updatedData };
      });

      return { previousProjects };
    },
    onError: (err, newProjects, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.projects, context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    },
  });
}

// Certificates
export function useCertificates(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...queryKeys.certificates, params],
    queryFn: () => apiClient.get('/certificates', params),
  });
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: queryKeys.certificate(id),
    queryFn: () => apiClient.get(`/certificates/${id}`),
    enabled: !!id,
  });
}

export function useCreateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CertificateFormData, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post('/certificates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates });
    },
  });
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CertificateFormData>) =>
      apiClient.put(`/certificates/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates });
      queryClient.invalidateQueries({ queryKey: queryKeys.certificate(variables.id) });
    },
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/certificates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.certificates });
    },
  });
}

// Timeline
export function useTimelineItems(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...queryKeys.timeline, params],
    queryFn: () => apiClient.get('/timeline', params),
  });
}

export function useTimelineItem(id: string) {
  return useQuery({
    queryKey: queryKeys.timelineItem(id),
    queryFn: () => apiClient.get(`/timeline/${id}`),
    enabled: !!id,
  });
}

export function useCreateTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TimelineItemFormData, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post('/timeline', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

export function useUpdateTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<TimelineItemFormData>) =>
      apiClient.put(`/timeline/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
      queryClient.invalidateQueries({ queryKey: queryKeys.timelineItem(variables.id) });
    },
  });
}

export function useDeleteTimelineItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/timeline/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline });
    },
  });
}

// Skills
export function useSkills(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...queryKeys.skills, params],
    queryFn: () => apiClient.get('/skills', params),
  });
}

export function useSkill(id: string) {
  return useQuery({
    queryKey: queryKeys.skill(id),
    queryFn: () => apiClient.get(`/skills/${id}`),
    enabled: !!id,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SkillFormData, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post('/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills });
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<SkillFormData>) =>
      apiClient.put(`/skills/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills });
      queryClient.invalidateQueries({ queryKey: queryKeys.skill(variables.id) });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills });
    },
  });
}

// Contact Messages
export function useContactMessages(params?: Record<string, any>) {
  return useQuery({
    queryKey: [...queryKeys.contactMessages, params],
    queryFn: () => apiClient.get('/contact', params),
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.put(`/contact/${id}/read`),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contactMessages });

      const previousMessages = queryClient.getQueryData(queryKeys.contactMessages);

      queryClient.setQueryData(queryKeys.contactMessages, (old: any) => {
        if (!old?.data?.messages) return old;

        const updatedMessages = old.data.messages.map((message: any) =>
          message._id === messageId
            ? { ...message, isRead: true, status: 'read' }
            : message
        );

        // Decrease unread count
        const unreadCount = Math.max(0, (old.data.unreadCount || 0) - 1);

        return {
          ...old,
          data: {
            ...old.data,
            messages: updatedMessages,
            unreadCount,
          },
        };
      });

      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.contactMessages, context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages });
    },
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/contact/${id}`),
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contactMessages });

      const previousMessages = queryClient.getQueryData(queryKeys.contactMessages);

      queryClient.setQueryData(queryKeys.contactMessages, (old: any) => {
        if (!old?.data?.messages) return old;

        // Find the message being deleted to check if it was unread
        const messageToDelete = old.data.messages.find((msg: any) => msg._id === messageId);
        const wasUnread = messageToDelete && !messageToDelete.isRead;

        const filteredMessages = old.data.messages.filter((message: any) => message._id !== messageId);

        return {
          ...old,
          data: {
            ...old.data,
            messages: filteredMessages,
            unreadCount: wasUnread
              ? Math.max(0, (old.data.unreadCount || 0) - 1)
              : old.data.unreadCount,
          },
        };
      });

      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.contactMessages, context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages });
    },
  });
}

// File uploads
export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder = 'general' }: { file: File; folder?: string }) =>
      apiClient.uploadFile(file, folder),
  });
}

export function useUploadFiles() {
  return useMutation({
    mutationFn: ({ files, folder = 'general' }: { files: File[]; folder?: string }) =>
      apiClient.uploadFiles(files, folder),
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (publicId: string) => apiClient.deleteFile(publicId),
  });
}

// Contact form submission
export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; subject?: string; message: string }) =>
      apiClient.submitContactMessage(data),
  });
}

// Authentication
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiClient.login(credentials),
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

export function useVerifyToken() {
  return useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: () => apiClient.verifyToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Contact Messages with optimistic updates
export function useCreateContactMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ContactMessageData) => apiClient.post('/contact', data),
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.contactMessages });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(queryKeys.contactMessages);

      // Optimistically update
      queryClient.setQueryData(queryKeys.contactMessages, (old: any) => {
        if (!old?.data) return old;

        const optimisticMessage = {
          _id: `temp-${Date.now()}`,
          ...newMessage,
          status: 'unread',
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          data: {
            ...old.data,
            messages: [optimisticMessage, ...(old.data.messages || [])],
            unreadCount: (old.data.unreadCount || 0) + 1,
          },
        };
      });

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.contactMessages, context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages });
    },
  });
}
// About
export function useAbout() {
  return useQuery({
    queryKey: queryKeys.about,
    queryFn: () => apiClient.get('/about'),
  });
}

export function useAboutAll() {
  return useQuery({
    queryKey: queryKeys.aboutAll,
    queryFn: () => apiClient.get('/about/all'),
  });
}

export function useAboutItem(id: string) {
  return useQuery({
    queryKey: queryKeys.aboutItem(id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.about });
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutAll });
    },
  });
}

export function useUpdateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<AboutFormData>) =>
      apiClient.put(`/about/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.about });
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutItem(variables.id) });
    },
  });
}

export function useDeleteAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/about/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.about });
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutAll });
    },
  });
}

export function useActivateAbout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.put(`/about/${id}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.about });
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutAll });
    },
  });
}
