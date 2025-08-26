import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  AcademicCapIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useTimelineItems, useDeleteTimelineItem } from '@/lib/queries';
import { DataTable, Column } from '@/components/admin/DataTable';
import { TimelineItemForm } from '@/components/admin/TimelineItemForm';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { TimelineItemFormData } from '@/lib/schemas';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const typeIcons = {
  work: BriefcaseIcon,
  education: AcademicCapIcon,
  achievement: StarIcon,
  other: StarIcon,
};

const typeColors = {
  work: 'text-blue-600',
  education: 'text-green-600',
  achievement: 'text-yellow-600',
  other: 'text-gray-600',
};

export function TimelinePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<TimelineItemFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<TimelineItemFormData | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, error } = useTimelineItems();
  const deleteTimelineItemMutation = useDeleteTimelineItem();

  const timelineItems = data?.data || [];

  const filteredItems = searchQuery
    ? timelineItems.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : timelineItems;

  const columns: Column<TimelineItemFormData>[] = [
    {
      key: 'type',
      label: 'Type',
      width: '16',
      render: (type: string) => {
        const Icon = typeIcons[type as keyof typeof typeIcons] || StarIcon;
        const colorClass = typeColors[type as keyof typeof typeColors] || 'text-gray-600';

        return (
          <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        );
      },
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (title: string, item: TimelineItemFormData) => (
        <div>
          <span className="font-medium text-foreground">{title}</span>
          {item.company && (
            <p className="text-sm text-muted-foreground mt-1">{item.company}</p>
          )}
          {item.location && (
            <p className="text-sm text-muted-foreground">
              <MapPinIcon className="h-3 w-3 inline mr-1" />
              {item.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Period',
      sortable: true,
      render: (startDate: string, item: TimelineItemFormData) => {
        const start = new Date(startDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });
        const end = item.endDate
          ? new Date(item.endDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })
          : 'Present';

        return (
          <div className="text-sm">
            <div className="font-medium text-foreground">{start} - {end}</div>
            <div className="text-muted-foreground">
              {item.endDate ? 'Completed' : 'Current'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (description: string) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
          {description}
        </p>
      ),
    },
    {
      key: 'skills',
      label: 'Skills',
      render: (skills: string[]) => (
        <div className="flex flex-wrap gap-1">
          {skills?.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {skills && skills.length > 2 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{skills.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const handleDelete = async (item: TimelineItemFormData) => {
    setDeletingItem(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingItem) {
      try {
        await deleteTimelineItemMutation.mutateAsync(deletingItem._id!);
        setIsDeleteOpen(false);
        setDeletingItem(null);
      } catch (error) {
        console.error('Failed to delete timeline item:', error);
      }
    }
  };

  const openForm = (item?: TimelineItemFormData) => {
    setEditingItem(item || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
        <p className="text-muted-foreground">Manage your career timeline and key milestones</p>
      </motion.div>

      {/* Data Table */}
      <DataTable
        data={filteredItems}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        searchPlaceholder="Search timeline items..."
        onSearch={setSearchQuery}
        onCreate={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        onView={openForm}
        createLabel="Add Timeline Item"
        emptyMessage="No timeline items found"
        keyExtractor={(item) => item._id!}
        searchableFields={['title', 'description', 'company', 'location']}
      />

      {/* Timeline Item Form Modal */}
      <TimelineItemForm
        timelineItem={editingItem}
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
          setDeletingItem(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Timeline Item"
        message="Are you sure you want to delete this timeline item?"
        itemName={deletingItem?.title}
        isLoading={deleteTimelineItemMutation.isPending}
      />
    </div>
  );
}
