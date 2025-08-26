import { z } from 'zod';

// Base schemas for common fields
const baseSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Project schema
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  longDescription: z
    .string()
    .max(5000, 'Long description cannot exceed 5000 characters')
    .optional(),
  tags: z
    .array(z.string().max(30, 'Tag cannot exceed 30 characters'))
    .min(1, 'At least one tag is required'),
  links: z.object({
    github: z
      .string()
      .url('GitHub link must be a valid URL')
      .optional()
      .or(z.literal('')),
    live: z
      .string()
      .url('Live link must be a valid URL')
      .optional()
      .or(z.literal('')),
  }),
  images: z
    .array(z.string().url('Image must be a valid URL'))
    .min(1, 'At least one image is required'),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
}).merge(baseSchema);

export type ProjectFormData = z.infer<typeof projectSchema>;

// Certificate schema
export const certificateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title cannot exceed 150 characters'),
  organization: z
    .string()
    .min(1, 'Organization is required')
    .max(100, 'Organization cannot exceed 100 characters'),
  issueDate: z
    .string()
    .min(1, 'Issue date is required')
    .refine((date) => {
      const parsedDate = new Date(date);
      return parsedDate <= new Date();
    }, 'Issue date cannot be in the future'),
  credentialId: z
    .string()
    .max(100, 'Credential ID cannot exceed 100 characters')
    .optional(),
  url: z
    .string()
    .url('URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  image: z
    .string()
    .url('Image must be a valid URL')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().max(30, 'Tag cannot exceed 30 characters'))
    .default([]),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
}).merge(baseSchema);

export type CertificateFormData = z.infer<typeof certificateSchema>;

// Timeline Item schema
export const timelineItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title cannot exceed 150 characters'),
  startDate: z
    .string()
    .min(1, 'Start date is required'),
  endDate: z
    .string()
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  bullets: z
    .array(z.string().max(300, 'Bullet point cannot exceed 300 characters'))
    .default([]),
  icon: z
    .string()
    .max(50, 'Icon cannot exceed 50 characters')
    .optional(),
  location: z
    .string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),
  type: z
    .enum(['work', 'education', 'achievement', 'other'])
    .default('work'),
  company: z
    .string()
    .max(100, 'Company cannot exceed 100 characters')
    .optional(),
  skills: z
    .array(z.string().max(30, 'Skill cannot exceed 30 characters'))
    .default([]),
}).merge(baseSchema).refine((data) => {
  // Only validate if both dates are provided and not empty
  if (data.endDate && data.endDate.trim() && data.startDate && data.startDate.trim()) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export type TimelineItemFormData = z.infer<typeof timelineItemSchema>;

// Skill schema
export const skillSchema = z.object({
  name: z
    .string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name cannot exceed 50 characters'),
  level: z
    .number()
    .int()
    .min(0, 'Skill level cannot be less than 0')
    .max(100, 'Skill level cannot be more than 100'),
  category: z
    .enum([
      'Frontend',
      'Backend',
      'Database',
      'DevOps',
      'Mobile',
      'Design',
      'Tools',
      'Languages',
      'Frameworks',
      'Other'
    ]),
}).merge(baseSchema);

export type SkillFormData = z.infer<typeof skillSchema>;

// About schema
export const aboutSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  subtitle: z
    .string()
    .max(150, 'Subtitle cannot exceed 150 characters')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
  highlights: z
    .array(z.string().max(200, 'Highlight cannot exceed 200 characters'))
    .default([]),
  personalInfo: z.object({
    email: z
      .string()
      .email('Please enter a valid email')
      .optional()
      .or(z.literal('')),
    location: z
      .string()
      .max(100, 'Location cannot exceed 100 characters')
      .optional()
      .or(z.literal('')),
    availableForWork: z.boolean().default(true),
    yearsOfExperience: z
      .number()
      .min(0, 'Years of experience cannot be negative')
      .max(50, 'Years of experience cannot exceed 50')
      .optional()
  }).default({}),
  socialLinks: z.object({
    linkedin: z.string().optional().or(z.literal('')),
    github: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    website: z.string().optional().or(z.literal(''))
  }).default({}),
  funFacts: z
    .array(z.object({
      title: z
        .string()
        .min(1, 'Fun fact title is required')
        .max(50, 'Fun fact title cannot exceed 50 characters'),
      description: z
        .string()
        .min(1, 'Fun fact description is required')
        .max(200, 'Fun fact description cannot exceed 200 characters'),
      icon: z.string().optional().or(z.literal(''))
    }))
    .default([]),
  isActive: z.boolean().default(true)
}).merge(baseSchema);

export type AboutFormData = z.infer<typeof aboutSchema>;

// Contact Message schema (read-only for admin)
export const contactMessageSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  read: z.boolean().default(false),
}).merge(baseSchema);

export type ContactMessageData = z.infer<typeof contactMessageSchema>;

// Upload schema
export const uploadSchema = z.object({
  file: z.instanceof(File).refine((file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  }, 'Only image files are allowed'),
  folder: z.string().default('general'),
});

export type UploadFormData = z.infer<typeof uploadSchema>;

// API Response schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }).optional(),
  error: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
  errors?: string[];
};
