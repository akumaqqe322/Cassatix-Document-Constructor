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

export interface CaseData {
  id: string;
  clientName: string;
  caseNumber: string;
  courtName: string;
  filingDate: string;
  description: string;
}

export const QUEUE_NAME = 'document-generation';
export const TEMPLATE_VALIDATION_QUEUE = 'template-validation';

/**
 * Resolves Redis connection configuration based on environment variables.
 * Priority: REDIS_URL > (REDIS_HOST + REDIS_PORT + REDIS_USER + REDIS_PASSWORD) > localhost
 */
export function getRedisConnection(): any {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const username = process.env.REDIS_USER || undefined;
  const password = process.env.REDIS_PASSWORD || undefined;

  return {
    host,
    port,
    username,
    password,
  };
}
