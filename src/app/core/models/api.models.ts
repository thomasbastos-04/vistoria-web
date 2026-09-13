export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  accessToken: string;
  expiresAtUtc: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PhotoRequirement {
  id?: string;
  code: string;
  label: string;
  required: boolean;
  sortOrder: number;
  uploaded?: boolean;
}

export interface InspectionTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  active: boolean;
  createdAtUtc: string;
  photoRequirements: PhotoRequirement[];
}

export interface CreateTemplateRequest {
  name: string;
  category: string;
  description?: string;
  photoRequirements: PhotoRequirement[];
}

export interface InspectionSummary {
  id: string;
  templateName: string;
  recipientName: string;
  recipientEmail: string;
  assetIdentification: string;
  status: number;
  expiresAtUtc: string;
  createdAtUtc: string;
  completedAtUtc?: string;
}

export interface CreateInspectionRequest {
  templateId: string;
  recipientName: string;
  recipientEmail: string;
  assetIdentification: string;
  linkValidDays: number;
}

export interface CreatedInspection {
  id: string;
  publicUrl: string;
  publicToken: string;
  expiresAtUtc: string;
}

export interface PublicInspection {
  id: string;
  templateName: string;
  category: string;
  recipientName: string;
  assetIdentification: string;
  status: number;
  expiresAtUtc: string;
  requirements: PhotoRequirement[];
}

export interface ProblemDetails {
  title?: string;
  status?: number;
}
