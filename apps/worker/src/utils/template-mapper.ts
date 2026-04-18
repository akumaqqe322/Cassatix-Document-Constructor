import { GenerationContext } from '@app/shared';

/**
 * Maps generic generation context to specific template placeholders
 * based on template code. This ensures that even if external data
 * doesn't perfectly match template names, placeholders are filled.
 */
export function mapTemplateVariables(context: GenerationContext, templateCode: string): Record<string, any> {
  const { case: caseData, client, variables: contextVars } = context;
  
  // Base variables are always included
  const result: Record<string, any> = { ...contextVars };

  // Explicit mappings for demo templates
  switch (templateCode) {
    case 'POW-ATT-001': // Power of Attorney
      result.grantorName = client.name;
      result.grantorAddress = client.organization || contextVars.registryRef || 'Principal Business Address';
      result.effectiveDate = contextVars.openingDate;
      result.agentName = result.agentName || `${client.shortName} Representative`;
      result.agentAddress = result.agentAddress || `${contextVars.courtName || 'Local Registry'} Chambers`;
      result.powersDescription = caseData.contractNumber ? `Under agreement ${caseData.contractNumber}: ${contextVars.description}` : contextVars.description;
      result.expiryDate = caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString() : 'Indefinite until revoked';
      result.signingLocation = contextVars.courtName || 'Administrative Office';
      break;

    case 'CLAIM-GEN-001': // Statement of Claim
      result.claimantName = client.name;
      result.defendantName = result.defendantName || 'The Named Defendant';
      result.incidentDate = contextVars.openingDate;
      result.incidentLocation = contextVars.courtName || 'Jurisdictional Venue';
      result.damageDescription = contextVars.description;
      result.claimAmount = caseData.amount || 0;
      result.currency = caseData.currency || 'USD';
      result.lawyerName = 'Counsel for Claimant';
      result.issueDate = contextVars.openingDate;
      break;

    case 'AGR-SERV-001': // Service Agreement
      result.partyAName = client.name;
      result.partyBName = result.partyBName || 'The Service Provider';
      result.contractDate = contextVars.openingDate;
      result.serviceDescription = contextVars.description;
      result.paymentAmount = contextVars.amountFormatted;
      result.termDuration = '12 Months';
      result.terminationNoticePeriod = '30 Days';
      result.governingLaw = contextVars.courtName || 'State Law';
      break;

    case 'DEM-PAY-001': // Demand Letter
      result.letterDate = contextVars.openingDate;
      result.recipientName = result.recipientName || 'Outstanding Debtor';
      result.recipientAddress = result.recipientAddress || 'Default Billing Address';
      result.debtAmount = contextVars.amountFormatted;
      result.dueDate = caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString() : 'Immediate';
      result.paymentInstructions = 'Wire Transfer or Corporate Check';
      result.creditorName = client.name;
      break;
  }

  // Final Pass: Ensure no keys are 'undefined' to avoid literal "undefined" in docx
  // We use "N/A" as a safe visible fallback for legal documents
  Object.keys(result).forEach(key => {
    if (result[key] === undefined || result[key] === null) {
      result[key] = '[N/A]';
    }
  });

  return result;
}
