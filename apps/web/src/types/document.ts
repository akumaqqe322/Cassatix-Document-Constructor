export enum DocumentStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum GenerationType {
  PREVIEW = 'PREVIEW',
  FINAL = 'FINAL',
}

export enum OutputFormat {
  DOCX = 'DOCX',
  PDF = 'PDF',
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateVersionId: string;
  caseId: string;
  requestedById: string;
  generationType: GenerationType;
  outputFormat: OutputFormat;
  status: DocumentStatus;
  storagePath: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  // Included relations
  template?: {
    name: string;
    code: string;
  };
}

export interface DocumentFilters {
  status?: DocumentStatus;
  generationType?: GenerationType;
  outputFormat?: OutputFormat;
  search?: string;
}
