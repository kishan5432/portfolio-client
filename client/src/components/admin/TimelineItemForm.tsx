import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { TimelineItemFormData } from '@/lib/schemas';
import { useCreateTimelineItem, useUpdateTimelineItem } from '@/lib/queries';

interface TimelineItemFormProps {
  timelineItem?: TimelineItemFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const timelineIcons = [
  'briefcase',
  'academic-cap',
  'graduation-cap',
  'code-bracket',
  'rocket-launch',
  'heart',
  'star',
  'trophy',
  'lightbulb',
  'globe-alt',
  'user-group',
  'chart-bar',
  'cog',
  'puzzle-piece',
  'fire',
  'sparkles',
  'microchip',
  'newspaper',
  'database',
  'image',
  'laptop-code',
  'certificate'
];

const timelineTypes = [
  { value: 'work', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'other', label: 'Other' }
];

export function TimelineItemForm({ timelineItem, isOpen, onClose, onSuccess }: TimelineItemFormProps) {
  const [formData, setFormData] = useState<Partial<TimelineItemFormData>>({
    title: '',
    type: 'work',
    startDate: '',
    endDate: '',
    description: '',
    bullets: [''],
    icon: 'briefcase',
    location: '',
    company: '',
    skills: [],
  });
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTimelineItemMutation = useCreateTimelineItem();
  const updateTimelineItemMutation = useUpdateTimelineItem();

  const isEditing = !!timelineItem?._id;

  useEffect(() => {
    if (timelineItem) {
      setFormData({
        title: timelineItem.title || '',
        type: timelineItem.type || 'work',
        startDate: timelineItem.startDate ? new Date(timelineItem.startDate).toISOString().split('T')[0] : '',
        endDate: timelineItem.endDate ? new Date(timelineItem.endDate).toISOString().split('T')[0] : '',
        description: timelineItem.description || '',
        bullets: timelineItem.bullets && timelineItem.bullets.length > 0 ? timelineItem.bullets : [''],
        icon: timelineItem.icon || 'briefcase',
        location: timelineItem.location || '',
        company: timelineItem.company || '',
        skills: timelineItem.skills || [],
      });
    } else {
      setFormData({
        title: '',
        type: 'work',
        startDate: '',
        endDate: '',
        description: '',
        bullets: [''],
        icon: 'briefcase',
        location: '',
        company: '',
        skills: [],
      });
    }
    setNewSkill('');
    setErrors({});
  }, [timelineItem]);

  // Clear end date error when dates are valid
  useEffect(() => {
    if (errors.endDate && formData.startDate && formData.endDate && formData.endDate.trim()) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate >= startDate) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.endDate;
          return newErrors;
        });
      }
    }
  }, [formData.startDate, formData.endDate, errors.endDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.bullets || formData.bullets.length === 0 || !formData.bullets[0]?.trim()) {
      newErrors.bullets = 'At least one bullet point is required';
    }

    // Validate date range if both dates are provided
    if (formData.startDate && formData.endDate && formData.endDate.trim()) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after or equal to start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Prepare the data for submission
      const submitData: any = {
        title: formData.title?.trim(),
        type: formData.type,
        description: formData.description?.trim(),
        bullets: formData.bullets?.filter(bullet => bullet.trim()) || [],
        skills: formData.skills || [],
        icon: formData.icon,
        location: formData.location?.trim(),
        company: formData.company?.trim(),
      };

      // Handle dates properly
      if (formData.startDate && formData.startDate.trim()) {
        submitData.startDate = new Date(formData.startDate).toISOString();
      }

      if (formData.endDate && formData.endDate.trim()) {
        submitData.endDate = new Date(formData.endDate).toISOString();
      }

      // Remove empty strings and undefined values
      const cleanData = Object.fromEntries(
        Object.entries(submitData).filter(([_, value]) => {
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
      );

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Original form data:', formData);
      console.log('Cleaned data being sent:', cleanData);
      console.log('Is editing:', isEditing);
      console.log('Timeline item ID:', timelineItem?._id);

      if (isEditing) {
        await updateTimelineItemMutation.mutateAsync({
          id: timelineItem._id!,
          ...cleanData,
        });
      } else {
        await createTimelineItemMutation.mutateAsync(cleanData as Omit<TimelineItemFormData, 'id' | 'createdAt' | 'updatedAt'>);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save timeline item:', error);
    }
  };

  const addBullet = () => {
    setFormData(prev => ({
      ...prev,
      bullets: [...(prev.bullets || []), '']
    }));
  };

  const removeBullet = (index: number) => {
    if (formData.bullets && formData.bullets.length > 1) {
      setFormData(prev => ({
        ...prev,
        bullets: prev.bullets?.filter((_, i) => i !== index) || []
      }));
    }
  };

  const updateBullet = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      bullets: prev.bullets?.map((bullet, i) => i === index ? value : bullet) || []
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
            className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {isEditing ? 'Edit Timeline Item' : 'Create New Timeline Item'}
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
                  placeholder="Enter timeline item title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title}</p>
                )}
              </div>

              {/* Type and Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={formData.type || 'work'}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {timelineTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter company or organization"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.startDate ? 'border-destructive' : 'border-border'
                      }`}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive mt-1">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.endDate ? 'border-destructive' : 'border-border'}`}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for current position</p>
                  {errors.endDate && (
                    <p className="text-sm text-destructive mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.description ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter timeline item description"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description}</p>
                )}
              </div>

              {/* Bullets */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bullet Points *
                </label>
                <div className="space-y-2">
                  {formData.bullets?.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={`Bullet point ${index + 1}`}
                      />
                      {formData.bullets && formData.bullets.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeBullet(index)}
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
                    onClick={addBullet}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Bullet Point
                  </Button>
                </div>
                {errors.bullets && (
                  <p className="text-sm text-destructive mt-1">{errors.bullets}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Skills & Technologies
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Add a skill or technology"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSkill.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              skills: [...(prev.skills || []), newSkill.trim()]
                            }));
                            setNewSkill('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newSkill.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...(prev.skills || []), newSkill.trim()]
                          }));
                          setNewSkill('');
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.skills && formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                skills: prev.skills?.filter((_, i) => i !== index) || []
                              }));
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                  Icon
                </label>
                <select
                  id="icon"
                  value={formData.icon || 'briefcase'}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {timelineIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter location (e.g., Company, City, Country)"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTimelineItemMutation.isPending || updateTimelineItemMutation.isPending}
                >
                  {createTimelineItemMutation.isPending || updateTimelineItemMutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Timeline Item'
                      : 'Create Timeline Item'
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
