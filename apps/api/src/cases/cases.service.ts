import { Injectable, HttpStatus } from '@nestjs/common';
import { CaseData, GenerationContext } from '@app/shared';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

/**
 * Interface representing the raw data format from the external "Project 2.0" database.
 * This is a stand-in for the real external schema we expect to integrate with later.
 */
interface Project2CaseRecord {
  internal_id: string;
  external_ref: string;
  client_legal_name: string;
  client_handle: string;
  org_unit?: string;
  matter_type: string;
  lifecycle_status: string;
  estimated_value?: number;
  val_currency?: string;
  opened_at: string;
  deadline_at?: string;
  jurisdiction?: string;
  registry_ref?: string;
  agreement_id?: string;
  brief_summary: string;
  powers_description?: string;
  ext_metadata?: any;
}

@Injectable()
export class CasesService {
  // SIMULATED EXTERNAL DATA SOURCE (Project 2.0 Stand-in)
  private readonly project2Source: Project2CaseRecord[] = [
    {
      internal_id: 'case-123',
      external_ref: '2024-CIV-001',
      client_legal_name: 'Acme Corporation International',
      client_handle: 'Acme Corp',
      org_unit: 'Global Operations',
      matter_type: 'COMMERCIAL_LITIGATION',
      lifecycle_status: 'ACTIVE',
      estimated_value: 250000,
      val_currency: 'USD',
      opened_at: '2024-01-15T09:00:00Z',
      deadline_at: '2025-01-15T17:00:00Z',
      jurisdiction: 'Superior Court of California',
      registry_ref: 'CA-CIV-1002',
      agreement_id: 'AGR-2023-99',
      brief_summary: 'Breach of contract dispute regarding software licensing and professional services delivery.',
      powers_description: 'Full authority to represent Acme Corp in all matters relating to civil litigation CA-CIV-1002, including settlement negotiations and filing of pleadings.',
    },
    {
      internal_id: 'case-456',
      external_ref: '2024-FAM-099',
      client_legal_name: 'John Quincy Doe',
      client_handle: 'John Doe',
      matter_type: 'FAMILY_DISSOLUTION',
      lifecycle_status: 'PENDING',
      opened_at: '2024-02-20T10:30:00Z',
      jurisdiction: 'Family Court of New York',
      registry_ref: 'NY-FAM-2024-X',
      brief_summary: 'Uncontested divorce proceeding including simplified asset division.',
      powers_description: 'Authority to execute documents related to asset division and financial disclosures for the pending dissolution of marriage.',
    },
    {
      internal_id: 'case-789',
      external_ref: '2024-CORP-442',
      client_legal_name: 'TechFlow Solutions Ltd',
      client_handle: 'TechFlow',
      org_unit: 'APAC Division',
      matter_type: 'CORPORATE_M_A',
      lifecycle_status: 'DUE_DILIGENCE',
      estimated_value: 12000000,
      val_currency: 'EUR',
      opened_at: '2024-03-01T08:00:00Z',
      deadline_at: '2024-06-30T23:59:59Z',
      agreement_id: 'M&A-TF-2024',
      brief_summary: 'Acquisition of minority stake in local cloud infrastructure provider.',
    },
  ];

  /**
   * ADAPTER: Maps raw Project 2.0 data to the internal CaseData format used by the UI.
   */
  private mapToInternal(raw: Project2CaseRecord): CaseData {
    return {
      id: raw.internal_id,
      clientId: raw.client_handle.toLowerCase().replace(/\s+/g, '-'),
      clientFullName: raw.client_legal_name,
      clientShortName: raw.client_handle,
      organization: raw.org_unit,
      caseNumber: raw.external_ref,
      caseType: raw.matter_type,
      status: raw.lifecycle_status,
      amount: raw.estimated_value,
      currency: raw.val_currency,
      issueDate: raw.opened_at,
      dueDate: raw.deadline_at,
      courtName: raw.jurisdiction,
      filingDate: raw.opened_at,
      contractNumber: raw.agreement_id,
      description: raw.brief_summary,
      powersDescription: raw.powers_description,
      metadata: raw.ext_metadata,
    };
  }

  /**
   * ADAPTER: Maps raw Project 2.0 data to a normalized GenerationContext used by the document engine.
   */
  private mapToGenerationContext(raw: Project2CaseRecord): GenerationContext {
    return {
      case: {
        id: raw.internal_id,
        number: raw.external_ref,
        type: raw.matter_type,
        status: raw.lifecycle_status,
        amount: raw.estimated_value,
        currency: raw.val_currency,
        issueDate: raw.opened_at,
        dueDate: raw.deadline_at,
        contractNumber: raw.agreement_id,
        description: raw.brief_summary,
        powersDescription: raw.powers_description,
      },
      client: {
        id: raw.client_handle.toLowerCase().replace(/\s+/g, '-'),
        name: raw.client_legal_name,
        shortName: raw.client_handle,
        organization: raw.org_unit,
      },
      variables: {
        // Flattened variables for direct template usage
        caseNumber: raw.external_ref,
        caseType: raw.matter_type,
        clientName: raw.client_legal_name,
        shortClientName: raw.client_handle,
        courtName: raw.jurisdiction,
        registryRef: raw.registry_ref,
        amountFormatted: raw.estimated_value ? `${raw.val_currency || 'USD'} ${raw.estimated_value.toLocaleString()}` : 'N/A',
        openingDate: new Date(raw.opened_at).toLocaleDateString(),
        contractId: raw.agreement_id || 'NOT_SPECIFIED',
        powersDescription: raw.powers_description,
        description: raw.brief_summary,
      }
    };
  }

  async findAll(): Promise<CaseData[]> {
    return this.project2Source.map(c => this.mapToInternal(c));
  }

  async getCaseData(caseId: string): Promise<CaseData> {
    const raw = this.project2Source.find((c) => c.internal_id === caseId);
    if (!raw) {
      throw new DomainException(
        `Case with ID ${caseId} not found in Project 2.0`,
        ErrorCode.CASE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return this.mapToInternal(raw);
  }

  async getGenerationContext(caseId: string): Promise<GenerationContext> {
    const raw = this.project2Source.find((c) => c.internal_id === caseId);
    if (!raw) {
      throw new DomainException(
        `Case with ID ${caseId} not found in Project 2.0`,
        ErrorCode.CASE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }
    return this.mapToGenerationContext(raw);
  }
}
