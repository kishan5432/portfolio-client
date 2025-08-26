import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CodeBracketIcon,
  ServerStackIcon,
  CloudIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon,
  CommandLineIcon,
  CubeIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Button } from '@/components/ui/Button';

interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
}

interface SkillsSectionProps {
  skills: Skill[];
  loading?: boolean;
  showAll?: boolean;
  maxSkills?: number;
}

// Category icons mapping
const categoryIcons = {
  'Languages': CommandLineIcon,
  'Frontend': CodeBracketIcon,
  'Backend': ServerStackIcon,
  'Database': CubeIcon,
  'DevOps': CloudIcon,
  'Tools': WrenchScrewdriverIcon,
  'Design': PaintBrushIcon,
  'Frameworks': CpuChipIcon,
  'Other': EyeIcon,
};

// Category colors
const categoryColors = {
  'Languages': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Frontend': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Backend': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Database': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'DevOps': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'Tools': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  'Design': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'Frameworks': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  'Other': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
};

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = categoryIcons[skill.category as keyof typeof categoryIcons] || EyeIcon;
  const colorClass = categoryColors[skill.category as keyof typeof categoryColors] || categoryColors.Other;

  return (
    <motion.div
      className="group"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
    >
      <div className="relative glass-card rounded-xl p-4 h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 border border-border/50 hover:border-accent/30">
        {/* Skill Level Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent/80"
            initial={{ width: 0 }}
            whileInView={{ width: `${skill.level}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            viewport={{ once: true }}
          />
        </div>

        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div className={`flex-shrink-0 p-2 rounded-lg border ${colorClass} transition-all duration-300 group-hover:scale-110`}>
            <IconComponent className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Skill Name */}
            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors">
              {skill.name}
            </h3>

            {/* Category Badge */}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {skill.category}
            </span>

            {/* Skill Level */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
              <span className="text-xs font-medium text-accent">
                {skill.level}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SkillCategoryPreview({ category, skills, index }: { category: string; skills: Skill[]; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || EyeIcon;
  const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.Other;
  const topSkills = skills.slice(0, 3);

  return (
    <motion.div
      className="group"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
    >
      <div className="glass-card rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 border border-border/50 hover:border-accent/30">
        {/* Category Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-lg border ${colorClass} transition-all duration-300 group-hover:scale-110`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
              {category}
            </h3>
            <p className="text-sm text-muted-foreground">{skills.length} skills</p>
          </div>
        </div>

        {/* Top Skills */}
        <div className="space-y-3">
          {topSkills.map((skill, skillIndex) => (
            <div key={skill._id} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{skill.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + skillIndex * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  />
                </div>
                <span className="text-xs text-accent font-medium w-8 text-right">
                  {skill.level}%
                </span>
              </div>
            </div>
          ))}

          {skills.length > 3 && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              +{skills.length - 3} more skills
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SkillsSection({ skills, loading, showAll = false, maxSkills = 8 }: SkillsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: maxSkills }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 h-32 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-20 mb-2" />
                <div className="h-1.5 bg-muted rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <CodeBracketIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No skills found</h3>
        <p className="text-muted-foreground">Skills will appear here once they're added.</p>
      </div>
    );
  }

  if (showAll) {
    // Group skills by category for about page
    const skillsByCategory = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);

    // Sort categories by skill count and skills by level
    const sortedCategories = Object.entries(skillsByCategory)
      .sort(([, a], [, b]) => b.length - a.length)
      .map(([category, categorySkills]) => ({
        category,
        skills: categorySkills.sort((a, b) => b.level - a.level)
      }));

    return (
      <div className="space-y-8">
        {/* Category Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.map(({ category, skills }, index) => (
            <SkillCategoryPreview
              key={category}
              category={category}
              skills={skills}
              index={index}
            />
          ))}
        </div>

        {/* All Skills Grid */}
        <div>
          <motion.h3
            className="text-xl font-semibold text-foreground mb-6"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            All Skills
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {skills
              .sort((a, b) => b.level - a.level)
              .map((skill, index) => (
                <SkillCard key={skill._id} skill={skill} index={index} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  // Homepage preview - show top skills
  const topSkills = skills
    .sort((a, b) => b.level - a.level)
    .slice(0, maxSkills);

  return (
    <div className="space-y-6">
      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topSkills.map((skill, index) => (
          <SkillCard key={skill._id} skill={skill} index={index} />
        ))}
      </div>

      {/* View All Button */}
      {skills.length > maxSkills && (
        <motion.div
          className="text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <Button variant="secondary" asChild>
            <Link to="/about#skills" className="inline-flex items-center gap-2">
              View All {skills.length} Skills
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
