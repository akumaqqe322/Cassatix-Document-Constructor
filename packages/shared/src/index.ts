/**
 * Shared types and constants for the legal document constructor system.
 */

export interface User {
  id: string;
  email: string;
  name?: string;
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface DocumentMetadata {
  id: string;
  title: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export const QUEUE_NAME = 'document-generation';
