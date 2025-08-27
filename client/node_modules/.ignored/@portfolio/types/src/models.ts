export interface CloudinaryImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  bytes?: number;
  version?: number;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  techStack: string[];
  images: CloudinaryImage[];
  thumbnail?: CloudinaryImage;
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'library' | 'other';
  status: 'completed' | 'in-progress' | 'planned' | 'archived';
  featured: boolean;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  teamSize?: number;
  myRole?: string;
  challenges?: string[];
  learnings?: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  image: CloudinaryImage;
  pdfUrl?: string;
  category: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationUrl?: string;
  skills?: string[];
  description?: string;
  issuedBy?: {
    name: string;
    url?: string;
    logo?: CloudinaryImage;
  };
  verified: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineItem {
  _id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  type: 'education' | 'experience' | 'project' | 'achievement';
  icon: string;
  company?: string;
  location?: string;
  skills?: string[];
  achievements?: string[];
  url?: string;
  image?: CloudinaryImage;
  ongoing: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'design' | 'other';
  proficiency: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  yearsOfExperience?: number;
  icon?: string;
  color?: string;
  description?: string;
  projects?: string[]; // Project IDs
  certifications?: string[]; // Certificate IDs
  lastUsed?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  type: 'general' | 'project' | 'collaboration' | 'hire';
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'replied' | 'archived';
  isRead: boolean;
  reply?: string;
  repliedAt?: Date;
  ip?: string;
  userAgent?: string;
  source?: string; // website, linkedin, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: CloudinaryImage;
  bio?: string;
  title?: string;
  location?: string;
  website?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    dribbble?: string;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    publicProfile: boolean;
  };
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends Omit<User, 'password'> {
  token?: string;
}
