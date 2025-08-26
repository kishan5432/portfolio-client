import type {
  Certificate,
  ContactMessage,
  Project,
  Skill,
  TimelineItem,
  User,
  AuthUser,
  CloudinaryImage,
} from './models';

// Standard API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Base query params
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Project API Types
export interface CreateProjectRequest {
  title: string;
  description: string;
  shortDescription?: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  tags: string[];
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'library' | 'other';
  status: 'completed' | 'in-progress' | 'planned' | 'archived';
  featured?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  teamSize?: number;
  myRole?: string;
  challenges?: string[];
  learnings?: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  order?: number;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> { }

export interface ProjectFilters extends BaseQueryParams {
  tags?: string[];
  category?: string;
  status?: string;
  featured?: boolean;
  techStack?: string[];
}

// Certificate API Types
export interface CreateCertificateRequest {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  category: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationUrl?: string;
  skills?: string[];
  description?: string;
  issuedBy?: {
    name: string;
    url?: string;
  };
  verified?: boolean;
  order?: number;
}

export interface UpdateCertificateRequest extends Partial<CreateCertificateRequest> { }

export interface CertificateFilters extends BaseQueryParams {
  category?: string;
  verified?: boolean;
  issuer?: string;
  skills?: string[];
}

// Timeline API Types
export interface CreateTimelineRequest {
  title: string;
  description: string;
  date: string;
  endDate?: string;
  type: 'education' | 'experience' | 'project' | 'achievement';
  icon: string;
  company?: string;
  location?: string;
  skills?: string[];
  achievements?: string[];
  url?: string;
  ongoing?: boolean;
  order?: number;
}

export interface UpdateTimelineRequest extends Partial<CreateTimelineRequest> { }

export interface TimelineFilters extends BaseQueryParams {
  type?: string;
  company?: string;
  ongoing?: boolean;
  skills?: string[];
}

// Skill API Types
export interface CreateSkillRequest {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'design' | 'other';
  proficiency: 1 | 2 | 3 | 4 | 5;
  yearsOfExperience?: number;
  icon?: string;
  color?: string;
  description?: string;
  projects?: string[];
  certifications?: string[];
  lastUsed?: string;
  order?: number;
}

export interface UpdateSkillRequest extends Partial<CreateSkillRequest> { }

export interface SkillFilters extends BaseQueryParams {
  category?: string;
  proficiency?: number;
  yearsOfExperience?: number;
}

// Contact API Types
export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  type?: 'general' | 'project' | 'collaboration' | 'hire';
}

export interface UpdateContactRequest {
  status?: 'unread' | 'read' | 'replied' | 'archived';
  priority?: 'low' | 'medium' | 'high';
  reply?: string;
}

export interface ContactFilters extends BaseQueryParams {
  status?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
}

// Upload Types
export interface UploadRequest {
  file: File;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
}

export interface UploadResponse extends CloudinaryImage {
  success: boolean;
  message?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  uploads: UploadResponse[];
  failed: {
    file: string;
    error: string;
  }[];
}

// Stats and Analytics
export interface DashboardStats {
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    featured: number;
  };
  certificates: {
    total: number;
    verified: number;
    categories: Record<string, number>;
  };
  messages: {
    total: number;
    unread: number;
    thisMonth: number;
  };
  skills: {
    total: number;
    byCategory: Record<string, number>;
  };
}

export interface AnalyticsData {
  pageViews: {
    total: number;
    thisMonth: number;
    topPages: {
      path: string;
      views: number;
    }[];
  };
  visitors: {
    total: number;
    unique: number;
    returning: number;
  };
  referrers: {
    source: string;
    visits: number;
  }[];
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: ValidationError[];
  stack?: string;
  timestamp?: string;
}

// Search and Filter Types
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  took: number;
  suggestions?: string[];
}

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export interface FilterGroup {
  name: string;
  options: FilterOption[];
}

// Bulk Operations
export interface BulkOperation {
  action: 'update' | 'delete' | 'archive';
  ids: string[];
  data?: Record<string, unknown>;
}

export interface BulkOperationResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors?: {
    id: string;
    error: string;
  }[];
}