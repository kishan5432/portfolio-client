import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { SkillFormData } from '@/lib/schemas';
import { useCreateSkill, useUpdateSkill } from '@/lib/queries';

interface SkillFormProps {
  skill?: SkillFormData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const skillCategories = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Tools',
  'Design',
  'Mobile',
  'Other'
];

export function SkillForm({ skill, isOpen, onClose, onSuccess }: SkillFormProps) {
  const [formData, setFormData] = useState<Partial<SkillFormData>>({
    name: '',
    level: 50,
    category: 'Frontend',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSkillMutation = useCreateSkill();
  const updateSkillMutation = useUpdateSkill();

  const isEditing = !!skill?._id;

  useEffect(() => {
    if (skill) {
      setFormData({
        name: skill.name || '',
        level: skill.level || 50,
        category: skill.category || 'Frontend',
      });
    } else {
      setFormData({
        name: '',
        level: 50,
        category: 'Frontend',
      });
    }
    setErrors({});
  }, [skill]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Skill name is required';
    }
    if (formData.level === undefined || formData.level < 0 || formData.level > 100) {
      newErrors.level = 'Level must be between 0 and 100';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditing) {
        await updateSkillMutation.mutateAsync({
          id: skill._id!,
          ...formData,
        });
      } else {
        await createSkillMutation.mutateAsync(formData as Omit<SkillFormData, 'id' | 'createdAt' | 'updatedAt'>);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
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
            className="bg-background rounded-lg shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {isEditing ? 'Edit Skill' : 'Create New Skill'}
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
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Skill Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter skill name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category || 'Frontend'}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${errors.category ? 'border-destructive' : 'border-border'
                    }`}
                >
                  {skillCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category}</p>
                )}
              </div>

              {/* Level */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-foreground mb-2">
                  Proficiency Level: {formData.level || 50}%
                </label>
                <input
                  type="range"
                  id="level"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.level || 50}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                  className={`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer ${errors.level ? 'border-destructive' : ''
                    }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
                {errors.level && (
                  <p className="text-sm text-destructive mt-1">{errors.level}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                >
                  {createSkillMutation.isPending || updateSkillMutation.isPending
                    ? 'Saving...'
                    : isEditing
                      ? 'Update Skill'
                      : 'Create Skill'
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
