import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LinkIcon,
  StarIcon,
  TagIcon,
  CalendarIcon,
  EyeIcon,
  CodeBracketIcon,
  Bars3Icon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useProjects, useDeleteProject, useReorderProjects } from '@/lib/queries';
import { DataTable, Column } from '@/components/admin/DataTable';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { ProjectFormData } from '@/lib/schemas';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SortableProjectRowProps {
  project: ProjectFormData;
  onEdit: (project: ProjectFormData) => void;
  onDelete: (project: ProjectFormData) => void;
  onView: (project: ProjectFormData) => void;
}

function SortableProjectRow({ project, onEdit, onDelete, onView }: SortableProjectRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'hover:bg-muted/50 transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      <td className="px-6 py-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <Bars3Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </td>

      {/* Image */}
      <td className="px-6 py-4">
        {project.images && project.images[0] && (
          <img
            src={buildCloudinaryUrl(project.images[0], cloudinaryTransforms.thumbnail)}
            alt={project.title}
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}
      </td>

      {/* Title */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{project.title}</span>
          {project.featured && (
            <StarIconSolid className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {project.description}
        </p>
      </td>

      {/* Tags */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {project.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags && project.tags.length > 2 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{project.tags.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Links */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <CodeBracketIcon className="h-4 w-4" />
            </a>
          )}
          {project.links?.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </td>

      {/* Order */}
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {project.order}
      </td>

      {/* Created */}
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {project.createdAt && new Date(project.createdAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(project)}
            className="h-8 w-8 p-0"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
            className="h-8 w-8 p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<ProjectFormData | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectFormData | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'sortable'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isLoading, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();
  const reorderProjectsMutation = useReorderProjects();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const projects = data?.data || [];
  const sortedProjects = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedProjects.findIndex((p) => p._id === active.id);
      const newIndex = sortedProjects.findIndex((p) => p._id === over.id);

      const newOrder = arrayMove(sortedProjects, oldIndex, newIndex);
      const updates = newOrder.map((project, index) => ({
        _id: project._id!,
        order: index,
      }));

      reorderProjectsMutation.mutate(updates);
    }
  };

  const filteredProjects = searchQuery
    ? projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    : projects;

  const columns: Column<ProjectFormData>[] = [
    {
      key: 'images',
      label: 'Image',
      width: '20',
      render: (images: string[]) =>
        images && images[0] ? (
          <img
            src={buildCloudinaryUrl(images[0], cloudinaryTransforms.thumbnail)}
            alt="Project"
            className="w-12 h-12 object-cover rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <TagIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        ),
    },
    {
      key: 'title',
      label: 'Project',
      sortable: true,
      render: (title: string, project: ProjectFormData) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{title}</span>
            {project.featured && (
              <StarIconSolid className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {project.description}
          </p>
        </div>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {tags && tags.length > 2 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'links',
      label: 'Links',
      render: (links: ProjectFormData['links']) => (
        <div className="flex items-center gap-2">
          {links?.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <CodeBracketIcon className="h-4 w-4" />
            </a>
          )}
          {links?.live && (
            <a
              href={links.live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      sortable: true,
      width: '20',
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const handleDelete = async (project: ProjectFormData) => {
    setDeletingProject(project);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProject) {
      try {
        await deleteProjectMutation.mutateAsync(deletingProject._id!);
        setIsDeleteOpen(false);
        setDeletingProject(null);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const openForm = (project?: ProjectFormData) => {
    setEditingProject(project || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  if (viewMode === 'sortable') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground">Manage your portfolio projects</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
            <Button onClick={() => openForm()}>
              Create Project
            </Button>
          </div>
        </div>

        {/* Sortable List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Links
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <SortableContext
                  items={sortedProjects.map((p) => p._id!)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedProjects.map((project) => (
                    <SortableProjectRow
                      key={project._id}
                      project={project}
                      onEdit={openForm}
                      onDelete={handleDelete}
                      onView={openForm}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your portfolio projects</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode('sortable')}
          >
            Reorder Projects
          </Button>
          <Button onClick={() => openForm()}>
            Create Project
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredProjects}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        searchPlaceholder="Search projects..."
        onSearch={setSearchQuery}
        onCreate={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        onView={openForm}
        createLabel="Create Project"
        emptyMessage="No projects found"
        keyExtractor={(project) => project._id!}
        searchableFields={['title', 'description']}
      />

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
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
          setDeletingProject(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        itemName={deletingProject?.title}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
}
