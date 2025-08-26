import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { Button } from '@/components/ui/Button';
import { AboutForm } from '@/components/admin/AboutForm';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { AboutFormData } from '@/lib/schemas';
import { useAboutAll, useDeleteAbout, useActivateAbout } from '@/lib/about-queries';

export function AboutPage() {
  const [editingAbout, setEditingAbout] = useState<AboutFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAbout, setDeletingAbout] = useState<AboutFormData | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, error } = useAboutAll();
  const deleteAboutMutation = useDeleteAbout();
  const activateAboutMutation = useActivateAbout();

  const aboutEntries = data?.data || [];

  const handleEdit = (about: AboutFormData) => {
    setEditingAbout(about);
    setIsFormOpen(true);
  };

  const handleDelete = (about: AboutFormData) => {
    setDeletingAbout(about);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingAbout) {
      try {
        await deleteAboutMutation.mutateAsync(deletingAbout._id!);
        setIsDeleteOpen(false);
        setDeletingAbout(null);
      } catch (error) {
        console.error('Failed to delete about entry:', error);
      }
    }
  };

  const handleActivate = async (about: AboutFormData) => {
    try {
      await activateAboutMutation.mutateAsync(about._id!);
    } catch (error) {
      console.error('Failed to activate about entry:', error);
    }
  };

  const openForm = (about?: AboutFormData) => {
    setEditingAbout(about || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAbout(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            <div className="h-5 bg-muted rounded w-48 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-muted rounded w-24 animate-pulse" />
        </div>

        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-48 mb-4" />
              <div className="h-4 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
          <XCircleIcon className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error loading about information</h3>
        <p className="text-muted-foreground mb-4">
          {error.message || 'There was an error loading the about information.'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">About Information</h1>
            <p className="text-muted-foreground">
              Manage your personal information and about section content
            </p>
          </div>
          <Button onClick={() => openForm()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create About Entry
          </Button>
        </div>
      </motion.div>

      {/* About Entries */}
      <div className="space-y-4">
        {aboutEntries.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <EyeIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No about information</h3>
            <p className="text-muted-foreground mb-4">
              Create your first about entry to get started.
            </p>
            <Button onClick={() => openForm()}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create About Entry
            </Button>
          </motion.div>
        ) : (
          aboutEntries.map((about, index) => (
            <motion.div
              key={about._id}
              className={`bg-card rounded-xl p-6 border transition-all duration-200 ${about.isActive
                  ? 'border-accent shadow-accent/10 shadow-lg'
                  : 'border-border hover:border-accent/50'
                }`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {about.title}
                    </h3>
                    {about.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                  {about.subtitle && (
                    <p className="text-muted-foreground text-sm mb-2">
                      {about.subtitle}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {about.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(about)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>

                  {!about.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActivate(about)}
                      className="text-accent hover:text-accent"
                      disabled={activateAboutMutation.isPending}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(about)}
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Highlights:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {about.highlights?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fun Facts:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {about.funFacts?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="ml-1 font-medium text-foreground">
                    {about.personalInfo?.yearsOfExperience || 0} years
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`ml-1 font-medium ${about.personalInfo?.availableForWork
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}>
                    {about.personalInfo?.availableForWork ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Social Links Preview */}
              {about.socialLinks && Object.values(about.socialLinks).some(link => link) && (
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">Social Links: </span>
                  <div className="flex gap-2 mt-1">
                    {about.socialLinks.linkedin && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">LinkedIn</span>
                    )}
                    {about.socialLinks.github && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">GitHub</span>
                    )}
                    {about.socialLinks.twitter && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Twitter</span>
                    )}
                    {about.socialLinks.website && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">Website</span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* About Form Modal */}
      <AboutForm
        about={editingAbout}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSuccess={closeForm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingAbout(null);
        }}
        onConfirm={confirmDelete}
        title="Delete About Entry"
        message="Are you sure you want to delete this about entry? This action cannot be undone."
        itemName={deletingAbout?.title}
        isLoading={deleteAboutMutation.isPending}
      />
    </div>
  );
}
