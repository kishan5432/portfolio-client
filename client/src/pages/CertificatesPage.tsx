import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TagIcon,
  MagnifyingGlassIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useCertificates } from '@/hooks/useDataFetching';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';

interface Certificate {
  _id: string;
  title: string;
  organization: string;
  issueDate: string;
  credentialId?: string;
  url?: string;
  image?: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Improved masonry layout hook with better height calculation
function useMasonryLayout(items: Certificate[], columns: number) {
  const [layout, setLayout] = useState<Certificate[][]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setLayout([]);
      return;
    }

    const columnArrays: Certificate[][] = Array.from({ length: columns }, () => []);

    // Simple distribution - put items in columns round-robin style
    items.forEach((item, index) => {
      const columnIndex = index % columns;
      columnArrays[columnIndex].push(item);
    });

    setLayout(columnArrays);
  }, [items, columns]);

  return layout;
}

// Lightbox component
function CertificateLightbox({
  certificates,
  currentIndex,
  onClose,
  onNext,
  onPrevious
}: {
  certificates: Certificate[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const current = certificates[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Navigation */}
        {certificates.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Content */}
        <motion.div
          className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative h-64 sm:h-80 lg:h-96 flex-shrink-0">
            <img
              src={buildCloudinaryUrl(current.image || '', cloudinaryTransforms.hero)}
              alt={current.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default image if loading fails
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&auto=format';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Details */}
          <div className="flex flex-col flex-1 min-h-0">
            {/* Fixed header content */}
            <div className="p-6 sm:p-8 flex-shrink-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {current.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-4 flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    {current.organization}
                  </p>
                </div>
                <div className="flex gap-2">
                  {current.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(current.url, '_blank')}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = buildCloudinaryUrl(current.image || '', cloudinaryTransforms.full);
                      link.download = `${current.title}-certificate.jpg`;
                      link.click();
                    }}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Issued: {new Date(current.issueDate).toLocaleDateString()}
                </div>
                {current.credentialId && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <TagIcon className="h-4 w-4 mr-2" />
                    ID: {current.credentialId}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex-1 overflow-y-auto min-h-0">
              <div className="space-y-6">
                {current.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      {current.description}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {current.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Skills & Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {current.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Certificate card component
function CertificateCard({
  certificate,
  onClick
}: {
  certificate: Certificate;
  onClick: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use proper image URL construction
  const imageUrl = certificate.image
    ? buildCloudinaryUrl(certificate.image, cloudinaryTransforms.card)
    : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop&auto=format';

  return (
    <motion.div
      className="break-inside-avoid mb-6 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse h-48" />
          )}
          <img
            src={imageUrl}
            alt={certificate.title}
            className={cn(
              'w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105',
              imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {certificate.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 flex items-center">
            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
            {certificate.organization}
          </p>
          <p className="text-xs text-muted-foreground mb-3 flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(certificate.issueDate).toLocaleDateString()}
          </p>

          {/* Tags */}
          {certificate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {certificate.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {certificate.tags.length > 2 && (
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                  +{certificate.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function CertificatesPage() {
  const { data: certificatesResponse, loading, error } = useCertificates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [columns, setColumns] = useState(3);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Extract certificates from API response and ensure proper typing
  const certificates: Certificate[] = Array.isArray(certificatesResponse?.data) ? certificatesResponse.data : [];

  // Get unique organizations and tags
  const allOrgs: string[] = Array.from(new Set(certificates.map(cert => cert.organization))).sort();
  const allTags: string[] = Array.from(new Set(certificates.flatMap(cert => cert.tags || []))).sort();

  // Filter certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = !selectedOrg || cert.organization === selectedOrg;
    const matchesTag = !selectedTag || (cert.tags && cert.tags.includes(selectedTag));
    return matchesSearch && matchesOrg && matchesTag;
  });

  const masonryLayout = useMasonryLayout(filteredCertificates, columns);

  const openLightbox = (certificate: Certificate) => {
    const index = filteredCertificates.findIndex(cert => cert._id === certificate._id);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const nextCertificate = () => {
    if (lightboxIndex !== null && lightboxIndex < filteredCertificates.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const previousCertificate = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Container>
          <div className="py-20">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-xl h-80"></div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Container>
          <div className="py-20 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Certificates</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container>
        <div className="py-20">
          {/* Header */}
          <div className="mb-12">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Certificates', href: '/certificates' }
              ]}
            />
            <SectionHeader
              title="Certificates & Achievements"
              subtitle="A collection of my professional certifications and achievements"
              className="mt-8"
            />
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Organization Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedOrg('')}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  selectedOrg === ''
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                All Organizations
              </button>
              {allOrgs.map((org: string) => (
                <button
                  key={org}
                  onClick={() => setSelectedOrg(org)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    selectedOrg === org
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {org}
                </button>
              ))}
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  selectedTag === ''
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                All Skills
              </button>
              {allTags.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                    selectedTag === tag
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">
              {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? 's' : ''} found
              {selectedOrg && ` from "${selectedOrg}"`}
              {selectedTag && ` with "${selectedTag}"`}
            </p>
          </div>

          {/* Masonry Grid */}
          {masonryLayout.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((certificate) => (
                <CertificateCard
                  key={certificate._id}
                  certificate={certificate}
                  onClick={() => openLightbox(certificate)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No certificates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </motion.div>
          )}

          {/* Lightbox */}
          {lightboxIndex !== null && (
            <CertificateLightbox
              certificates={filteredCertificates}
              currentIndex={lightboxIndex}
              onClose={closeLightbox}
              onNext={nextCertificate}
              onPrevious={previousCertificate}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
