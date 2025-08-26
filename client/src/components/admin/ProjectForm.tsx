import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ProjectFormData } from '@/lib/schemas';
import { apiClient } from '@/lib/api';
import { useCreateProject, useUpdateProject } from '@/lib/queries';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectFormProps {
  project?: ProjectFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectForm({ project, isOpen, onClose, onSuccess }: ProjectFormProps) {
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    title: '',
    slug: '',
    description: '',
    tags: [],
    links: { github: '', live: '' },
    images: [],
    featured: false,
    order: 0,
  });
  const [newTag, setNewTag] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const isEditing = !!project?._id;

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      tags: [],
      links: { github: '', live: '' },
      images: [],
      featured: false,
      order: 0,
    });
    setNewTag('');
    setErrors({});
  };

  const handleClose = () => {
    // Reset form when closing if it's a new project (not editing)
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  // Don't render if authentication is still loading
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-center mt-4 text-muted-foreground">Loading authentication...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        slug: project.slug || '',
        description: project.description || '',
        tags: project.tags || [],
        links: project.links || { github: '', live: '' },
        images: project.images || [],
        featured: project.featured || false,
        order: project.order || 0,
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [project]);

  // Reset form when modal opens for new project
  useEffect(() => {
    if (isOpen && !project) {
      resetForm();
    }
  }, [isOpen, project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData['title']?.trim()) {
      newErrors['title'] = 'Title is required';
    }
    if (!formData['slug']?.trim()) {
      newErrors['slug'] = 'Slug is required';
    }
    if (!formData['description']?.trim()) {
      newErrors['description'] = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing && project?._id) {
        await updateProjectMutation.mutateAsync({
          id: project._id,
          ...formData,
        });
      } else {
        await createProjectMutation.mutateAsync(formData as Omit<ProjectFormData, 'id' | 'createdAt' | 'updatedAt'>);
        // Reset form only for new projects, not when editing
        resetForm();
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check authentication before upload
    console.log('🔐 ProjectForm: Upload attempt - isAuthenticated:', isAuthenticated, 'token:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!isAuthenticated || !token) {
      console.error('User not authenticated. Cannot upload images.');
      setErrors({ images: 'You must be logged in to upload images' });
      return;
    }

    // Ensure API client has the token
    console.log('🔐 ProjectForm: Ensuring API client has token...');
    if (token) {
      apiClient.setToken(token);
    }

    // Small delay to ensure token is set
    await new Promise(resolve => setTimeout(resolve, 100));

    setUploadingImages(true);
    setErrors({ images: '' }); // Clear previous errors

    try {
      const uploadPromises = files.map(file =>
        apiClient.uploadFile(file, 'projects')
      );

      const results = await Promise.all(uploadPromises);
      const newImages = results
        .map(result => result.data.secure_url)
        .filter((url): url is string => Boolean(url)); // Type guard to ensure string type

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    } catch (error) {
      console.error('Failed to upload images:', error);
      setErrors({ images: 'Failed to upload images. Please try again.' });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Auto-generate slug when title changes (only for new projects)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-generate slug for new projects, not when editing
      slug: !isEditing && title ? generateSlug(title) : (prev.slug || '')
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {isEditing ? 'Edit Project' : 'Create New Project'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData['title'] || ''}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter project title"
                />
                {errors['title'] && (
                  <p className="mt-1 text-sm text-destructive">{errors['title']}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                  Slug * <span className="text-sm text-muted-foreground">
                    {isEditing ? '(editable)' : '(auto-generated)'}
                  </span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData['slug'] || ''}
                  readOnly={!isEditing}
                  onChange={isEditing ? (e) => setFormData(prev => ({ ...prev, slug: e.target.value })) : undefined}
                  className={`w-full px-3 py-2 border border-border rounded-md ${isEditing
                    ? 'bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  placeholder="project-slug"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {isEditing
                    ? 'You can manually edit the slug for this project'
                    : 'Slug is automatically generated from the title'
                  }
                </p>
                {errors['slug'] && (
                  <p className="mt-1 text-sm text-destructive">{errors['slug']}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData['description'] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter project description"
                />
                {errors['description'] && (
                  <p className="mt-1 text-sm text-destructive">{errors['description']}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-foreground mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="github"
                    value={formData.links?.github || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      links: { ...prev.links, github: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label htmlFor="live" className="block text-sm font-medium text-foreground mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    id="live"
                    value={formData.links?.live || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      links: { ...prev.links, live: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Images
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <PhotoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                    </p>
                  </label>
                </div>

                {/* Image previews */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Project ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <span className="text-sm text-foreground">Featured Project</span>
                </label>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-foreground mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    value={formData.order || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {createProjectMutation.isPending || updateProjectMutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Project'
                      : 'Create Project'
                  }
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
