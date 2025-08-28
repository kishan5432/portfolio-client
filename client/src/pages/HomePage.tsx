import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDownIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  StarIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { AnimatedText, TypingText } from '@/components/shared/AnimatedText';
import { Button } from '@/components/ui/Button';
import { useProjects, useCertificates, useTimelineItems } from '@/hooks/useDataFetching';
import { useSkills } from '@/lib/queries';
import { buildCloudinaryUrl, cloudinaryTransforms } from '@/lib/api';
import { SkillsSection } from '@/components/shared/SkillsSection';



// Interface definitions for type safety
interface Project {
  _id: string;
  title: string;
  description: string;
  images: string[];
  tags: string[];
  featured: boolean;
  links: {
    github?: string;
    live?: string;
  };
}

interface Certificate {
  _id: string;
  title: string;
  organization: string;
  image?: string;
  issueDate: string;
}

interface TimelineItem {
  _id: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  icon?: string;
}

export function HomePage() {
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Fetch data from API
  const { data: projectsResponse, loading: projectsLoading } = useProjects({ featured: true, limit: 3 });
  const { data: certificatesResponse, loading: certificatesLoading } = useCertificates({ limit: 3 });
  const { data: timelineResponse, loading: timelineLoading } = useTimelineItems({ limit: 2 });
  const { data: skillsResponse, isLoading: skillsLoading } = useSkills({ limit: 8 });

  // Extract data from API responses
  const featuredProjects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];
  const certificates = Array.isArray(certificatesResponse?.data) ? certificatesResponse.data : [];
  const timelineItems = Array.isArray(timelineResponse?.data) ? timelineResponse.data : [];
  const skills = Array.isArray(skillsResponse?.data?.skills) ? skillsResponse.data.skills : [];

  // Calculate stats from real data
  const stats = {
    projects: featuredProjects.length || 0,
    certificates: certificates.length || 0,
    experience: timelineItems.length || 0,
    technologies: 25 // Keep static for now
  };

  // Parallax transforms
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroY = useTransform(scrollY, [0, 300], [0, -50]);

  // Auto-rotate featured projects carousel
  useEffect(() => {
    if (shouldReduceMotion || featuredProjects.length === 0) return;

    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) =>
        (prev + 1) % featuredProjects.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, featuredProjects.length]);

  // Show loading state while data is being fetched
  if (projectsLoading || certificatesLoading || timelineLoading || skillsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh-bg"
        aria-labelledby="hero-heading"
      >
        {/* Parallax Background Shapes */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ y: shouldReduceMotion ? 0 : backgroundY }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        </motion.div>

        <Container className="relative z-10">
          <motion.div
            className="text-center"
            style={{ y: shouldReduceMotion ? 0 : heroY }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-hero p-1 shadow-colored-lg">
                <div className="w-full h-full rounded-full bg-background overflow-hidden glass-card relative">
                  <img
                    src="/images/profile.jpg"
                    alt="Kishan Kumar - Full Stack Developer"
                    className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                    loading="eager"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 hidden items-center justify-center bg-background rounded-full">
                    <span className="text-4xl font-bold text-accent text-shimmer">KK</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating greeting with bounce effect */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                y: [0, -10, 0]
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <motion.p
                className="text-lg text-muted-foreground mb-2 relative z-10"
                whileHover={{
                  scale: 1.1,
                  textShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
                }}
              >
                Hi, I'm
              </motion.p>
              {/* Floating particles around greeting */}
              <motion.div
                className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  x: [0, 5, 0],
                  y: [0, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-500 rounded-full"
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0.8, 0.3],
                  x: [0, -3, 0],
                  y: [0, 3, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </motion.div>

            {/* Enhanced name animation with glow effect */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <AnimatedText
                text="Kishan Kumar"
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-4 relative z-10"
                delay={0.4}
                type="letters"
                as="h1"
                id="hero-heading"
              />
              {/* Glowing background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8 }}
              />
              {/* Floating tech icons around name */}
              <motion.div
                className="absolute -top-4 -right-4 text-2xl"
                initial={{ opacity: 0, rotate: -180, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                whileHover={{ rotate: 360, scale: 1.2 }}
              >
                🚀
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-4 text-xl"
                initial={{ opacity: 0, rotate: 180, scale: 0 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                whileHover={{ rotate: -360, scale: 1.2 }}
              >
                💻
              </motion.div>
            </motion.div>

            {/* Enhanced subtitle with wave effect */}
            <motion.div
              className="h-16 mb-6 relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <TypingText
                text="A developer and explorer of technology."
                className="text-xl sm:text-2xl text-primary font-medium relative z-10"
                delay={1.5}
                speed={80}
              />
              {/* Animated underline */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 2.5 }}
              />
              {/* Floating dots */}
              <motion.div
                className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Enhanced description with staggered text reveal */}
            <motion.div
              className="max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.5 }}
            >
              <motion.p
                className="text-lg text-muted-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 2.8 }}
              >
                I craft intelligent web applications, experiment with IoT & AI, and create experiences that connect people with opportunities worldwide.
              </motion.p>
              {/* Floating highlight elements */}
              <motion.div
                className="absolute -left-8 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 3.2 }}
              />
              <motion.div
                className="absolute -right-8 top-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 3.4 }}
              />
            </motion.div>

            {/* Enhanced action buttons with creative animations */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 3 }}
            >
              {/* Floating background elements */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 rounded-3xl blur-xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 3.2 }}
              />

              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden"
                  onClick={() => {
                    const resumeUrl = '/resume.pdf';
                    const link = document.createElement('a');
                    link.href = resumeUrl;
                    link.download = 'Kishan_Kumar_Resume.pdf';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-20"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative z-10 flex items-center">
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Download Resume
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button variant="secondary" size="lg" asChild className="relative overflow-hidden">
                  <Link to="/projects" className="group">
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-primary"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "0%" }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center">
                      <EyeIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      View Projects
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Enhanced scroll indicator with particle trail */}
            <motion.div
              className="mt-16 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 3.5 }}
            >
              <motion.div
                className="relative"
                animate={{
                  y: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ArrowDownIcon className="w-6 h-6 mx-auto text-muted-foreground relative z-10" />

                {/* Particle trail effect */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 w-1 h-1 bg-primary rounded-full"
                    style={{ top: `${20 + i * 8}px` }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [0, 10, 20]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>

              {/* Floating tech icons around scroll indicator */}
              <motion.div
                className="absolute -left-8 top-1/2 text-lg"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                ⚡
              </motion.div>
              <motion.div
                className="absolute -right-8 top-1/2 text-lg"
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                🔥
              </motion.div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Animated Stats Section */}
      <section className="py-20 bg-muted/50 fade-mask-top fade-mask-bottom" aria-labelledby="stats-heading">
        <Container>
          <h2 id="stats-heading" className="sr-only">Portfolio Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Projects Completed', value: stats.projects, icon: CodeBracketIcon },
              { label: 'Certificates Earned', value: stats.certificates, icon: AcademicCapIcon },
              { label: 'Years Experience', value: stats.experience, icon: BriefcaseIcon },
              { label: 'Technologies', value: stats.technologies, icon: StarIcon }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center glass-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <motion.div
                  className="text-3xl font-bold text-foreground mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                >
                  {stat.value}+
                </motion.div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      

      {/* Featured Projects Carousel */}
      <section className="py-20" aria-labelledby="projects-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="projects-heading" className="text-3xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-muted-foreground">Some of my best work</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                className="flex"
                animate={{ x: `${-currentProjectIndex * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {featuredProjects.map((project, index) => (
                  <div
                    key={project._id}
                    className="w-full flex-shrink-0"
                    id={`project-${index}`}
                    role="tabpanel"
                    aria-labelledby={`project-tab-${index}`}
                    aria-hidden={index !== currentProjectIndex}
                  >
                    <div className="grid md:grid-cols-2 gap-8 items-center glass-card rounded-2xl overflow-hidden shadow-glass-lg">
                      <div className="p-8">
                        <h3 className="text-2xl font-bold mb-4">{project.title}</h3>
                        <p className="text-muted-foreground mb-6">{project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm glass-subtle"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-4">
                          {project.links?.github && (
                            <Button asChild variant="secondary" size="sm">
                              <a
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <CodeBracketIcon className="w-4 h-4" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.links?.live && (
                            <Button asChild variant="default" size="sm">
                              <a
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <EyeIcon className="w-4 h-4" />
                                Live Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="relative h-64 md:h-80">
                        <img
                          src={buildCloudinaryUrl(project.images?.[0], cloudinaryTransforms.hero) || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&auto=format'}
                          alt={`Screenshot of ${project.title} project showing the main interface`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width="600"
                          height="400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center mt-6 gap-2" role="tablist" aria-label="Project navigation">
              {featuredProjects.map((project, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProjectIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${index === currentProjectIndex ? 'bg-accent' : 'bg-muted'
                    }`}
                  role="tab"
                  aria-selected={index === currentProjectIndex}
                  aria-controls={`project-${index}`}
                  aria-label={`View ${project.title} project`}
                />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Skills Preview Section */}
      <section className="py-20 bg-muted/30" aria-labelledby="skills-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="skills-heading" className="text-3xl font-bold text-foreground mb-4">
              Technical Expertise
            </h2>
            <p className="text-muted-foreground">
              Technologies and tools I work with
            </p>
          </div>

          <SkillsSection
            skills={skills}
            loading={skillsLoading}
            maxSkills={8}
          />
        </Container>
      </section>

      {/* Recent Certificates Marquee */}
      <section className="py-20 bg-muted/50 overflow-hidden" aria-labelledby="certificates-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="certificates-heading" className="text-3xl font-bold text-foreground mb-4">Recent Certificates</h2>
            <p className="text-muted-foreground">Continuous learning and growth</p>
          </div>

          <div className="relative">
            <motion.div
              className="flex gap-6"
              animate={{
                x: shouldReduceMotion ? 0 : ['0%', '-50%']
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 20,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: 'linear'
              }}
            >
              {/* Duplicate certificates for seamless loop */}
              {[...certificates, ...certificates].map((cert, index) => (
                <motion.div
                  key={`${cert._id}-${index}`}
                  className="flex-shrink-0 w-80"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass-card rounded-2xl p-6 shadow-glass">
                    <img
                      src={cert.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=150&fit=crop&auto=format'}
                      alt={`${cert.title} certificate from ${cert.organization}`}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                      loading="lazy"
                      decoding="async"
                      width="320"
                      height="128"
                    />
                    <h3 className="font-semibold text-foreground mb-2">{cert.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{cert.organization}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Timeline Teaser */}
      <section className="py-20" aria-labelledby="timeline-heading">
        <Container>
          <div className="text-center mb-12">
            <h2 id="timeline-heading" className="text-3xl font-bold text-foreground mb-4">My Journey</h2>
            <p className="text-muted-foreground">Key milestones in my career</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {timelineItems.slice(0, 2).map((item, index) => (
              <motion.div
                key={item._id}
                className="flex gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-colored">
                    <BriefcaseIcon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  {index < timelineItems.length - 1 && (
                    <div className="w-px h-16 bg-border mx-auto mt-4" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.startDate).getFullYear()} - {item.endDate ? new Date(item.endDate).getFullYear() : 'Present'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}

            <div className="text-center mt-8">
              <Button variant="secondary" asChild>
                <Link to="/timeline">View Full Timeline</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Resume Section */}
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background" aria-labelledby="resume-heading">
        <Container>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 id="resume-heading" className="text-3xl font-bold text-foreground mb-4">Professional Resume</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Download my comprehensive resume to learn more about my experience, skills, and achievements
            </p>
          </motion.div>

          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50 mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <DocumentArrowDownIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Kishan Kumar - Full Stack Developer</h3>
              <p className="text-muted-foreground mb-6">
                Experienced developer with expertise in MERN stack, modern web technologies, and building scalable applications.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">React.js</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Node.js</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">MongoDB</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">TypeScript</span>
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">Tailwind CSS</span>
              </div>
              <Button
                size="lg"
                className="group w-full sm:w-auto"
                onClick={() => {
                  // You can replace this URL with your actual resume file
                  const resumeUrl = '/resume.pdf'; // or your Cloudinary URL
                  const link = document.createElement('a');
                  link.href = resumeUrl;
                  link.download = 'Kishan_Kumar_Resume.pdf';
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Download Resume (PDF)
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> You can also view my detailed experience and skills on the{' '}
              <Link to="/timeline" className="text-primary hover:underline">Timeline</Link> and{' '}
              <Link to="/about" className="text-primary hover:underline">About</Link> pages
            </p>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}