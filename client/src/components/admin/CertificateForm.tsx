import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { CertificateFormData } from '@/lib/schemas';
import { apiClient } from '@/lib/api';
import { useCreateCertificate, useUpdateCertificate } from '@/lib/queries';
import { useAuth } from '@/contexts/AuthContext';

interface CertificateFormProps {
  certificate?: CertificateFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CertificateForm({ certificate, isOpen, onClose, onSuccess }: CertificateFormProps) {
  const [formData, setFormData] = useState<Partial<CertificateFormData>>({
    title: '',
    organization: '',
    issueDate: '',
    credentialId: '',
    url: '',
    image: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCertificateMutation = useCreateCertificate();
  const updateCertificateMutation = useUpdateCertificate();
  const { isAuthenticated, token } = useAuth();

  const isEditing = !!certificate?._id;

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      issueDate: '',
      credentialId: '',
      url: '',
      image: '',
      tags: [],
    });
    setNewTag('');
    setErrors({});
  };

  useEffect(() => {
    if (certificate) {
      setFormData({
        title: certificate.title || '',
        organization: certificate.organization || '',
        issueDate: certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : '',
        credentialId: certificate.credentialId || '',
        url: certificate.url || '',
        image: certificate.image || '',
        tags: certificate.tags || [],
      });
    } else {
      resetForm();
    }
  }, [certificate]);

  // Reset form when modal opens for new certificate
  useEffect(() => {
    if (isOpen && !certificate) {
      resetForm();
    }
  }, [isOpen, certificate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.organization?.trim()) {
      newErrors.organization = 'Organization is required';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : undefined,
      };

      if (isEditing) {
        await updateCertificateMutation.mutateAsync({
          id: certificate._id!,
          ...submitData,
        });
      } else {
        await createCertificateMutation.mutateAsync(submitData as Omit<CertificateFormData, 'id' | 'createdAt' | 'updatedAt'>);
      }

      // Reset form after successful submission for new certificates
      if (!isEditing) {
        resetForm();
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save certificate:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check authentication before upload
    console.log('🔐 CertificateForm: Upload attempt - isAuthenticated:', isAuthenticated, 'token:', token ? `${token.substring(0, 20)}...` : 'null');

    if (!isAuthenticated || !token) {
      console.error('User not authenticated. Cannot upload certificate image.');
      setErrors({ ...errors, image: 'You must be logged in to upload images' });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ ...errors, image: 'File size must be less than 10MB' });
      return;
    }

    // Ensure API client has the token
    console.log('🔐 CertificateForm: Ensuring API client has token...');
    if (token) {
      apiClient.setToken(token);
    }

    // Small delay to ensure token is set
    await new Promise(resolve => setTimeout(resolve, 100));

    setUploadingImage(true);
    setErrors({ ...errors, image: '' }); // Clear previous errors

    try {
      console.log('📁 CertificateForm: Starting file upload...', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder: 'certificates'
      });

      const result = await apiClient.uploadFile(file, 'certificates');

      console.log('✅ CertificateForm: Upload successful', result);

      // Check if we have a valid response
      if (!result || !result.data) {
        throw new Error('Invalid response from upload service');
      }

      // Use secure_url for consistency
      const imageUrl = result.data.secure_url || result.data.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from upload service');
      }

      setFormData(prev => ({
        ...prev,
        image: imageUrl
      }));

      console.log('✅ CertificateForm: Image URL set:', imageUrl);

    } catch (error: any) {
      console.error('❌ CertificateForm: Upload failed:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to upload image. Please try again.';

      if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication expired. Please log in again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorMessage = 'You do not have permission to upload files.';
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = 'File is too large. Please choose a smaller image.';
        } else if (error.message.includes('415') || error.message.includes('Unsupported')) {
          errorMessage = 'Unsupported file type. Please choose a valid image.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }

      setErrors({ ...errors, image: errorMessage });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
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

  const handleClose = () => {
    // Reset form when closing if it's not editing an existing certificate
    if (!isEditing) {
      resetForm();
    }
    onClose();
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
                {isEditing ? 'Edit Certificate' : 'Create New Certificate'}
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
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.title ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter certificate title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">
                  Organization *
                </label>
                <input
                  type="text"
                  id="organization"
                  value={formData.organization || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.organization ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter organization name"
                />
                {errors.organization && (
                  <p className="text-sm text-destructive mt-1">{errors.organization}</p>
                )}
              </div>

              {/* Issue Date */}
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-foreground mb-2">
                  Issue Date *
                </label>
                <input
                  type="date"
                  id="issueDate"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.issueDate ? 'border-destructive' : 'border-border'
                    }`}
                />
                {errors.issueDate && (
                  <p className="text-sm text-destructive mt-1">{errors.issueDate}</p>
                )}
              </div>

              {/* Credential ID */}
              <div>
                <label htmlFor="credentialId" className="block text-sm font-medium text-foreground mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  id="credentialId"
                  value={formData.credentialId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter credential ID"
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                  Certificate URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
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

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Certificate Image
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="image-upload" className={`cursor-pointer ${uploadingImage ? 'opacity-50' : ''}`}>
                    <PhotoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {uploadingImage ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports: JPEG, PNG, GIF, WebP (max 10MB)
                    </p>
                  </label>
                </div>

                {/* Upload error */}
                {errors.image && (
                  <p className="text-sm text-destructive mt-2">{errors.image}</p>
                )}

                {/* Image preview */}
                {formData.image && (
                  <div className="mt-4 relative group">
                    <img
                      src={formData.image}
                      alt="Certificate"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCertificateMutation.isPending || updateCertificateMutation.isPending}
                >
                  {createCertificateMutation.isPending || updateCertificateMutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Certificate'
                      : 'Create Certificate'
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