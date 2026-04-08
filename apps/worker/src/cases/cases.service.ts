export interface CaseData {
  id: string;
  clientName: string;
  caseNumber: string;
  courtName: string;
  filingDate: string;
  description: string;
}

export class CasesService {
  private readonly mockCases: CaseData[] = [
    {
      id: 'case-123',
      clientName: 'Acme Corp',
      caseNumber: '2024-CIV-001',
      courtName: 'Superior Court of California',
      filingDate: '2024-01-15',
      description: 'Breach of contract dispute regarding software licensing.',
    },
    {
      id: 'case-456',
      clientName: 'John Doe',
      caseNumber: '2024-FAM-099',
      courtName: 'Family Court of New York',
      filingDate: '2024-02-20',
      description: 'Uncontested divorce proceeding.',
    },
  ];

  async getCaseData(caseId: string): Promise<CaseData> {
    const foundCase = this.mockCases.find((c) => c.id === caseId);
    if (!foundCase) {
      throw new Error(`Case with ID ${caseId} not found`);
    }
    return foundCase;
  }
}
