import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  HeartIcon,
  CodeBracketIcon,
  SparklesIcon,
  GlobeAltIcon,
  BookOpenIcon,
  MapPinIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
  CalendarIcon,
  LinkIcon,
  CameraIcon,
  BeakerIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Container } from '@/components/shared/Container';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { IconCloud } from '@/components/shared/IconCloud';
import { SkillsSection } from '@/components/shared/SkillsSection';
import { useSkills } from '@/lib/queries';
import { useAbout } from '@/lib/about-queries';
import { cn } from '@/lib/utils';

interface Skill {
  name: string;
  level: number;
  category: string;
}

// Animated skill bar component
function SkillBar({ skill, delay = 0 }: { skill: Skill; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isInView) {
      controls.start({
        width: `${skill.level}%`,
        transition: { duration: shouldReduceMotion ? 0 : 1.5, delay, ease: 'easeOut' }
      });
    }
  }, [isInView, controls, skill.level, delay, shouldReduceMotion]);

  return (
    <motion.div
      ref={ref}
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{skill.name}</span>
        <span className="text-sm text-muted-foreground">{skill.level}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="h-2 bg-gradient-to-r from-primary to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={controls}
        />
      </div>
    </motion.div>
  );
}

export function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  // Fetch real data from API
  const { data: aboutResponse, isLoading: aboutLoading, error: aboutError } = useAbout();
  const { data: skillsResponse, isLoading: skillsLoading } = useSkills();

  // Debug logging
  console.log('🔍 About response:', aboutResponse);
  console.log('⏳ About loading:', aboutLoading);
  console.log('❌ About error:', aboutError);

  const aboutData = aboutResponse?.data;
  const skills = Array.isArray(skillsResponse?.data?.skills) ? skillsResponse.data.skills : [];

  // TEMPORARY: Add some mock skills for testing
  const mockSkills = [
    { name: 'JavaScript', level: 90, category: 'Frontend' },
    { name: 'React', level: 85, category: 'Frontend' },
    { name: 'Node.js', level: 80, category: 'Backend' },
    { name: 'MongoDB', level: 75, category: 'Database' }
  ];
  const finalSkills = skills.length > 0 ? skills : mockSkills;

  console.log('📊 About data:', aboutData);
  console.log('🎯 Skills raw:', skills);
  console.log('🎯 Skills response:', skillsResponse);
  console.log('🎯 Final skills:', finalSkills);

  // Force a manual fetch for testing
  useEffect(() => {
    console.log('🚀 About page mounted, API calls should be happening...');
  }, []);

  // Loading state
  if (aboutLoading || skillsLoading) {
    return (
      <div className="min-h-screen py-8">
        <Container>
          <Breadcrumbs />
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mb-4" />
              <div className="h-4 bg-muted rounded w-96 mb-8" />
            </div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded-2xl animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <Container>
        <Breadcrumbs />

        {aboutData ? (
          <>
            {/* Header Section */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                {aboutData.title}
              </h1>
              {aboutData.subtitle && (
                <p className="text-xl text-accent font-medium mb-6">
                  {aboutData.subtitle}
                </p>
              )}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                {aboutData.personalInfo?.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    {aboutData.personalInfo.location}
                  </div>
                )}
                {aboutData.personalInfo?.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    {aboutData.personalInfo.email}
                  </div>
                )}
                {aboutData.personalInfo?.availableForWork && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckBadgeIcon className="h-4 w-4" />
                    Available for Work
                  </div>
                )}
                {aboutData.personalInfo?.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {aboutData.personalInfo.yearsOfExperience}+ Years Experience
                  </div>
                )}
              </div>
            </motion.div>

            {/* About Me Section */}
            <section className="mb-20">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                      {aboutData.description}
                    </div>
                  </div>

                  {/* Highlights */}
                  {aboutData.highlights && aboutData.highlights.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h3 className="text-xl font-semibold text-foreground mb-6">Key Highlights</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {aboutData.highlights.map((highlight, index) => (
                          <motion.div
                            key={index}
                            initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-3"
                          >
                            <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-2" />
                            <p className="text-muted-foreground">{highlight}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {aboutData.socialLinks && Object.values(aboutData.socialLinks).some(link => link) && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h3 className="text-xl font-semibold text-foreground mb-6">Connect with Me</h3>
                      <div className="flex flex-wrap gap-4">
                        {aboutData.socialLinks.linkedin && (
                          <a
                            href={aboutData.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {aboutData.socialLinks.github && (
                          <a
                            href={aboutData.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            GitHub
                          </a>
                        )}
                        {aboutData.socialLinks.twitter && (
                          <a
                            href={aboutData.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Twitter
                          </a>
                        )}
                        {aboutData.socialLinks.website && (
                          <a
                            href={aboutData.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </section>
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Me - DEBUG MODE</h1>
            <p className="text-muted-foreground mb-8">
              No about information available yet. Loading: {aboutLoading ? 'YES' : 'NO'}, Error: {aboutError ? 'YES' : 'NO'}
            </p>
            <div className="text-left max-w-md mx-auto bg-card p-4 rounded-lg">
              <pre className="text-xs">
                Response: {JSON.stringify(aboutResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <section id="skills" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Skills & Expertise</h2>
            <p className="text-muted-foreground mb-8">
              A comprehensive overview of my technical skills and proficiency levels
            </p>
          </div>

          <SkillsSection
            skills={finalSkills}
            loading={skillsLoading}
            showAll={true}
          />
        </section>

        {/* Fun Facts Section */}
        {aboutData && aboutData.funFacts && aboutData.funFacts.length > 0 && (
          <section className="mb-20">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Fun Facts About Me</h2>
                <p className="text-muted-foreground">
                  Beyond coding, here's what makes me tick
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {aboutData.funFacts.map((fact, index) => {
                  // Map icon names to actual icon components
                  const iconMap: Record<string, any> = {
                    'heart': HeartIcon,
                    'code-bracket': CodeBracketIcon,
                    'sparkles': SparklesIcon,
                    'globe-alt': GlobeAltIcon,
                    'beaker': BeakerIcon,
                    'rocket': RocketLaunchIcon,
                    'camera': CameraIcon,
                    'book-open': BookOpenIcon,
                    'lightbulb': LightBulbIcon,
                    // Add more mappings as needed
                  };

                  const IconComponent = iconMap[fact.icon || 'heart'] || HeartIcon;

                  return (
                    <motion.div
                      key={index}
                      className="bg-card p-6 rounded-xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow duration-300"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      whileHover={shouldReduceMotion ? {} : { y: -2 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-accent/10 text-accent">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {fact.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {fact.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}
      </Container>
    </div>
  );
}
