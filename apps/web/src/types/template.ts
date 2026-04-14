export enum TemplateStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TemplateVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  INVALID = 'INVALID',
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  status: TemplateVersionStatus;
  storagePath: string | null;
  fileName: string | null;
  changelog: string | null;
  validationStatus: ValidationStatus | null;
  validationError: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
  variablesSchemaJson: any;
  conditionsSchemaJson: any;
  createdAt: string;
  createdBy?: UserSummary;
}

export interface Template {
  id: string;
  name: string;
  code: string;
  category: string;
  caseType: string;
  status: TemplateStatus;
  publishedVersionId: string | null;
  publishedVersion?: TemplateVersion | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: UserSummary;
}

export interface TemplateFilters {
  status?: TemplateStatus;
  category?: string;
  caseType?: string;
  search?: string;
}
