import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  CodeBracketIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useDataFetching';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  tags: string[];
  links: {
    github?: string;
    live?: string;
  };
  images: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Tilt hover effect component
function TiltCard({ children, className, ...props }: { children: React.ReactNode; className?: string;[key: string]: any }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      whileHover={{
        rotateX: 5,
        rotateY: 5,
        scale: 1.02
      }}
      transition={{ duration: 0.2 }}
      style={{ perspective: 1000 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Project card component
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TiltCard className="group cursor-pointer">
      <motion.div
        className="bg-card rounded-xl overflow-hidden shadow-lg border border-border/50 h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -5 }}
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={buildCloudinaryUrl(project.images[0], cloudinaryTransforms.card)}
            alt={project.title}
            className={cn(
              'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.warn('Failed to load image:', project.images[0]);
              setImageLoaded(true); // Show even if error
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {project.links.github && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.github, '_blank');
                }}
              >
                <CodeBracketIcon className="h-4 w-4" />
              </Button>
            )}
            {project.links.live && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(project.links.live, '_blank');
                }}
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Date */}
          <p className="text-xs text-muted-foreground flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </TiltCard>
  );
}

// Project detail modal
function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!project) return null;

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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 h-8 w-8 p-0"
            onClick={onClose}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>

          {/* Image Gallery */}
          <div className="relative h-64 sm:h-80">
            <img
              src={buildCloudinaryUrl(project.images[currentImageIndex], cloudinaryTransforms.hero)}
              alt={project.title}
              className="w-full h-full object-cover"
            />

            {project.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) =>
                    prev === 0 ? project.images.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) =>
                    (prev + 1) % project.images.length
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  →
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {project.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {project.title}
                </h2>
                <p className="text-muted-foreground flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {project.featured && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                  Featured
                </span>
              )}
            </div>

            <p className="text-foreground mb-6 text-lg leading-relaxed">
              {project.description}
            </p>

            {/* Tags */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                <TagIcon className="h-4 w-4 mr-2" />
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-4">
              {project.links.live && (
                <Button asChild className="flex-1">
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Live Demo
                  </a>
                </Button>
              )}
              {project.links.github && (
                <Button variant="outline" asChild className="flex-1">
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <CodeBracketIcon className="h-4 w-4 mr-2" />
                    View Source Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ProjectsPage() {
  const { data: projectsResponse, loading, error } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Extract projects from API response and ensure proper typing
  const projects: Project[] = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];

  // Get all unique tags
  const allTags: string[] = Array.from(new Set(projects.flatMap((project: Project) => project.tags))).sort();

  // Filter projects
  const filteredProjects = projects.filter((project: Project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || project.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Breadcrumbs />
          <SectionHeader
            title="My Projects"
            subtitle="Portfolio"
            description="A collection of projects I've worked on, showcasing different technologies and problem-solving approaches."
          />
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading projects...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Breadcrumbs />
          <SectionHeader
            title="My Projects"
            subtitle="Portfolio"
            description="A collection of projects I've worked on, showcasing different technologies and problem-solving approaches."
          />
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Error loading projects: {error}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Breadcrumbs />

        <SectionHeader
          title="My Projects"
          subtitle="Portfolio"
          description="A collection of projects I've worked on, showcasing different technologies and problem-solving approaches."
        />

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('')}
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                selectedTag === ''
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              All Projects
            </button>
            {allTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            {selectedTag && ` with "${selectedTag}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Projects Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence>
            {filteredProjects.map((project: Project) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or selected tags.
            </p>
          </motion.div>
        )}

        {/* Project Detail Modal */}
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </Container>
    </div>
  );
}
