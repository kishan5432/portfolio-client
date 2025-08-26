import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { AboutFormData } from '@/lib/schemas';
import { useCreateAbout, useUpdateAbout } from '@/lib/about-queries';

interface AboutFormProps {
  about?: AboutFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const availableIcons = [
  'heart',
  'code-bracket',
  'sparkles',
  'globe-alt',
  'academic-cap',
  'briefcase',
  'coffee',
  'musical-note',
  'camera',
  'book-open',
  'rocket-launch',
  'lightning-bolt',
  'star',
  'fire',
  'puzzle-piece'
];

export function AboutForm({ about, isOpen, onClose, onSuccess }: AboutFormProps) {
  const [formData, setFormData] = useState<Partial<AboutFormData>>({
    title: '',
    subtitle: '',
    description: '',
    highlights: [''],
    personalInfo: {
      email: '',
      location: '',
      availableForWork: true,
      yearsOfExperience: 0
    },
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      website: ''
    },
    funFacts: [],
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createAboutMutation = useCreateAbout();
  const updateAboutMutation = useUpdateAbout();

  const isEditing = !!about?._id;

  useEffect(() => {
    if (about) {
      setFormData({
        title: about.title || '',
        subtitle: about.subtitle || '',
        description: about.description || '',
        highlights: about.highlights && about.highlights.length > 0 ? about.highlights : [''],
        personalInfo: {
          email: about.personalInfo?.email || '',
          location: about.personalInfo?.location || '',
          availableForWork: about.personalInfo?.availableForWork ?? true,
          yearsOfExperience: about.personalInfo?.yearsOfExperience || 0
        },
        socialLinks: {
          linkedin: about.socialLinks?.linkedin || '',
          github: about.socialLinks?.github || '',
          twitter: about.socialLinks?.twitter || '',
          website: about.socialLinks?.website || ''
        },
        funFacts: about.funFacts || [],
        isActive: about.isActive ?? true
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        highlights: [''],
        personalInfo: {
          email: '',
          location: '',
          availableForWork: true,
          yearsOfExperience: 0
        },
        socialLinks: {
          linkedin: '',
          github: '',
          twitter: '',
          website: ''
        },
        funFacts: [],
        isActive: true
      });
    }
    setErrors({});
  }, [about]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.highlights || formData.highlights.length === 0 || !formData.highlights[0]?.trim()) {
      newErrors.highlights = 'At least one highlight is required';
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
        highlights: formData.highlights?.filter(highlight => highlight.trim()) || [],
        funFacts: formData.funFacts || []
      };

      if (isEditing) {
        await updateAboutMutation.mutateAsync({
          id: about._id!,
          ...submitData,
        });
      } else {
        await createAboutMutation.mutateAsync(submitData as Omit<AboutFormData, 'id' | 'createdAt' | 'updatedAt'>);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save about information:', error);
    }
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), '']
    }));
  };

  const removeHighlight = (index: number) => {
    if (formData.highlights && formData.highlights.length > 1) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights?.map((highlight, i) => i === index ? value : highlight) || []
    }));
  };

  const addFunFact = () => {
    setFormData(prev => ({
      ...prev,
      funFacts: [...(prev.funFacts || []), { title: '', description: '', icon: 'heart' }]
    }));
  };

  const removeFunFact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      funFacts: prev.funFacts?.filter((_, i) => i !== index) || []
    }));
  };

  const updateFunFact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      funFacts: prev.funFacts?.map((fact, i) =>
        i === index ? { ...fact, [field]: value } : fact
      ) || []
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {isEditing ? 'Edit About Information' : 'Create About Information'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.title ? 'border-destructive' : 'border-border'}`}
                    placeholder="e.g., Hi, I'm John Doe"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subtitle" className="block text-sm font-medium text-foreground mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Full-Stack Developer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? 'border-destructive' : 'border-border'}`}
                  placeholder="Tell your story..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Key Highlights *
                </label>
                <div className="space-y-2">
                  {formData.highlights?.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateHighlight(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={`Highlight ${index + 1}`}
                      />
                      {formData.highlights && formData.highlights.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addHighlight}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Highlight
                  </Button>
                </div>
                {errors.highlights && (
                  <p className="text-sm text-destructive mt-1">{errors.highlights}</p>
                )}
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.personalInfo?.email || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo!, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.personalInfo?.location || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo!, location: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      id="experience"
                      min="0"
                      max="50"
                      value={formData.personalInfo?.yearsOfExperience || 0}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo!, yearsOfExperience: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableForWork"
                      checked={formData.personalInfo?.availableForWork || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo!, availableForWork: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="availableForWork" className="text-sm font-medium text-foreground">
                      Available for Work
                    </label>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-foreground mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks!, linkedin: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-foreground mb-2">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="github"
                      value={formData.socialLinks?.github || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks!, github: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-foreground mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      value={formData.socialLinks?.twitter || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks!, twitter: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-foreground mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks!, website: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>

              {/* Fun Facts */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Fun Facts</h3>
                <div className="space-y-4">
                  {formData.funFacts?.map((fact, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-foreground">Fun Fact {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeFunFact(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Icon
                          </label>
                          <select
                            value={fact.icon}
                            onChange={(e) => updateFunFact(index, 'icon', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {availableIcons.map((icon) => (
                              <option key={icon} value={icon}>
                                {icon.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={fact.title}
                            onChange={(e) => updateFunFact(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Fun fact title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={fact.description}
                            onChange={(e) => updateFunFact(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Fun fact description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={addFunFact}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Fun Fact
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Set as Active (only one can be active at a time)
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createAboutMutation.isPending || updateAboutMutation.isPending}
                >
                  {createAboutMutation.isPending || updateAboutMutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update About'
                      : 'Create About'
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
