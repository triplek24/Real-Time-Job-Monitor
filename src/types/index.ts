// User types
export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
export interface JobFilters {
  page?: number;
  search?: string;
  position?: string;
  experienceRange?: string;
  status?: string;
}
// Job types
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// src/types/index.ts
export interface Job {
  id: string;
  title: string;
  position: 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'STAFF';
  experience: string;
  description: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  createdById: string;
  creator?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  jobs: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Metrics types
export interface Metrics {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
  successRate: number;
  timestamp?: string;
}