import { useState } from 'react';
import { motion } from 'framer-motion';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import { useSkills, useDeleteSkill } from '@/lib/queries';
import { DataTable, Column } from '@/components/admin/DataTable';
import { SkillForm } from '@/components/admin/SkillForm';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { SkillFormData } from '@/lib/schemas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const categoryColors = {
  Frontend: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Backend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Database: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  DevOps: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Mobile: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Design: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  Tools: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Languages: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Frameworks: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  Other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function SkillLevelBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-muted rounded-full h-2">
        <div
          className="h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground min-w-[3ch]">
        {level}%
      </span>
    </div>
  );
}

export function SkillsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSkill, setEditingSkill] = useState<SkillFormData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<SkillFormData | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, error } = useSkills();
  const deleteSkillMutation = useDeleteSkill();

  const skills = data?.data?.skills || [];
  const categories = Object.keys(categoryColors);

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = !searchQuery ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const columns: Column<SkillFormData>[] = [
    {
      key: 'name',
      label: 'Skill',
      sortable: true,
      render: (name: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <CpuChipIcon className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">{name}</span>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Proficiency',
      sortable: true,
      width: '64',
      render: (level: number) => <SkillLevelBar level={level} />,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (category: string) => (
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            categoryColors[category as keyof typeof categoryColors] || categoryColors.Other
          )}
        >
          {category}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Added',
      sortable: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const handleDelete = async (skill: SkillFormData) => {
    setDeletingSkill(skill);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingSkill) {
      try {
        await deleteSkillMutation.mutateAsync(deletingSkill._id!);
        setIsDeleteOpen(false);
        setDeletingSkill(null);
      } catch (error) {
        console.error('Failed to delete skill:', error);
      }
    }
  };

  const openForm = (skill?: SkillFormData) => {
    setEditingSkill(skill || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Skills</h1>
        <p className="text-muted-foreground">Manage your technical skills and proficiency levels</p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <button
          onClick={() => setSelectedCategory('')}
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            selectedCategory === ''
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {/* Skills Overview */}
      {data?.data?.skillsByCategory && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {Object.entries(data.data.skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    categoryColors[category as keyof typeof categoryColors] || categoryColors.Other
                  )}
                >
                  {category}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({(categorySkills as any[]).length})
                </span>
              </h3>
              <div className="space-y-2">
                {(categorySkills as any[]).slice(0, 3).map((skill) => (
                  <div key={skill._id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                ))}
                {(categorySkills as any[]).length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{(categorySkills as any[]).length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredSkills}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        searchPlaceholder="Search skills..."
        onSearch={setSearchQuery}
        onCreate={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        onView={openForm}
        createLabel="Add Skill"
        emptyMessage="No skills found"
        keyExtractor={(skill) => skill._id!}
        searchableFields={['name']}
      />

      {/* Skill Form Modal */}
      <SkillForm
        skill={editingSkill}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSuccess={() => {
          closeForm();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingSkill(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Skill"
        message="Are you sure you want to delete this skill?"
        itemName={deletingSkill?.name}
        isLoading={deleteSkillMutation.isPending}
      />
    </div>
  );
}
