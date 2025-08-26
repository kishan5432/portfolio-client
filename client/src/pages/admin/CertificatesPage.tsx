import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  LinkIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useCertificates, useDeleteCertificate } from '@/lib/queries';
import { DataTable, Column } from '@/components/admin/DataTable';
import { CertificateForm } from '@/components/admin/CertificateForm';
import { DeleteConfirmation } from '@/components/admin/DeleteConfirmation';
import { CertificateFormData } from '@/lib/schemas';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCertificate, setEditingCertificate] = useState<CertificateFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCertificate, setDeletingCertificate] = useState<CertificateFormData | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, error } = useCertificates();
  const deleteCertificateMutation = useDeleteCertificate();

  const certificates = data?.data || [];

  const filteredCertificates = searchQuery
    ? certificates.filter((cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    : certificates;

  const columns: Column<CertificateFormData>[] = [
    {
      key: 'image',
      label: 'Image',
      width: '20',
      render: (image: string) =>
        image ? (
          <img
            src={buildCloudinaryUrl(image, cloudinaryTransforms.thumbnail)}
            alt="Certificate"
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
      label: 'Certificate',
      sortable: true,
      render: (title: string, cert: CertificateFormData) => (
        <div>
          <span className="font-medium text-foreground">{title}</span>
          <p className="text-sm text-muted-foreground mt-1">
            <BuildingOfficeIcon className="h-3 w-3 inline mr-1" />
            {cert.organization}
          </p>
        </div>
      ),
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
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
      key: 'url',
      label: 'Link',
      render: (url: string) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <LinkIcon className="h-4 w-4" />
          </a>
        ) : null,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  const handleDelete = async (certificate: CertificateFormData) => {
    setDeletingCertificate(certificate);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCertificate) {
      try {
        await deleteCertificateMutation.mutateAsync(deletingCertificate._id!);
        setIsDeleteOpen(false);
        setDeletingCertificate(null);
      } catch (error) {
        console.error('Failed to delete certificate:', error);
      }
    }
  };

  const openForm = (certificate?: CertificateFormData) => {
    setEditingCertificate(certificate || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCertificate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-muted-foreground">Manage your professional certificates and achievements</p>
      </motion.div>

      {/* Data Table */}
      <DataTable
        data={filteredCertificates}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        searchPlaceholder="Search certificates..."
        onSearch={setSearchQuery}
        onCreate={() => openForm()}
        onEdit={openForm}
        onDelete={handleDelete}
        onView={openForm}
        createLabel="Add Certificate"
        emptyMessage="No certificates found"
        keyExtractor={(cert) => cert._id!}
        searchableFields={['title', 'organization']}
      />

      {/* Certificate Form Modal */}
      <CertificateForm
        certificate={editingCertificate}
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
          setDeletingCertificate(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate?"
        itemName={deletingCertificate?.title}
        isLoading={deleteCertificateMutation.isPending}
      />
    </div>
  );
}
