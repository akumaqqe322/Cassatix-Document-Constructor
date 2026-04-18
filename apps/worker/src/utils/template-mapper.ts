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

  // Define explicit placeholders for all demo templates to ensure coverage
  const placeholders: Record<string, any> = {
    // Default Fallbacks
    powersDescription: 'Authorised to act on all legal matters pertaining to the designated case and its related administrative requirements.',
    damageDescription: 'Losses and damages arising from the stated breach of contract, including consequential financial impact.',
    serviceDescription: 'Professional legal and administrative services as required by the statement of work.',
    paymentInstructions: 'Standard wire transfer to primary account.',
    recipientName: '[Specified Recipient]',
    recipientAddress: '[Recipient Address]',
    defendantName: '[Named Defendant]',
    partyBName: '[Service Provider]',
    agentName: `${client.shortName} Authorized Agent`,
    agentAddress: `${contextVars.courtName || 'Administrative Office'} Chambers`,
    expiryDate: 'Indefinite until revoked',
    signingLocation: contextVars.courtName || 'Administrative Office',
    termDuration: '12 Months',
    terminationNoticePeriod: '30 Days',
    governingLaw: contextVars.courtName || 'Governing Jurisdiction',
    clientName: client.name,
    caseNumber: caseData.number,
    issueDate: contextVars.openingDate,
    amountFormatted: contextVars.amountFormatted || 'N/A'
  };

  // Explicit mappings for demo templates
  switch (templateCode) {
    case 'POW-ATT-001': // Power of Attorney
      result.grantorName = client.name;
      result.grantorAddress = client.organization || contextVars.registryRef || 'Principal Business Address';
      result.effectiveDate = contextVars.openingDate;
      result.agentName = result.agentName || placeholders.agentName;
      result.agentAddress = result.agentAddress || placeholders.agentAddress;
      // Prioritize explicit case powers description, then manual description, then fallback
      const authorityText = caseData.powersDescription || contextVars.powersDescription || caseData.description || contextVars.description || placeholders.powersDescription;
      result.powersDescription = caseData.contractNumber ? `Under agreement ${caseData.contractNumber}: ${authorityText}` : authorityText;
      result.expiryDate = caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString() : placeholders.expiryDate;
      result.signingLocation = contextVars.courtName || placeholders.signingLocation;
      break;

    case 'CLAIM-GEN-001': // Statement of Claim
      result.claimantName = client.name;
      result.defendantName = result.defendantName || placeholders.defendantName;
      result.incidentDate = contextVars.openingDate;
      result.incidentLocation = contextVars.courtName || placeholders.incidentLocation;
      result.damageDescription = caseData.description || contextVars.description || placeholders.damageDescription;
      result.claimAmount = caseData.amount || 0;
      result.currency = caseData.currency || 'USD';
      result.lawyerName = 'Counsel for Claimant';
      result.issueDate = contextVars.openingDate;
      break;

    case 'AGR-SERV-001': // Service Agreement
      result.partyAName = client.name;
      result.partyBName = result.partyBName || placeholders.partyBName;
      result.contractDate = contextVars.openingDate;
      result.serviceDescription = caseData.description || contextVars.description || placeholders.serviceDescription;
      result.paymentAmount = contextVars.amountFormatted || placeholders.amountFormatted;
      result.termDuration = placeholders.termDuration;
      result.terminationNoticePeriod = placeholders.terminationNoticePeriod;
      result.governingLaw = contextVars.courtName || placeholders.governingLaw;
      break;

    case 'DEM-PAY-001': // Demand Letter
      result.letterDate = contextVars.openingDate;
      result.recipientName = result.recipientName || placeholders.recipientName;
      result.recipientAddress = result.recipientAddress || placeholders.recipientAddress;
      result.debtAmount = contextVars.amountFormatted || placeholders.amountFormatted;
      result.dueDate = caseData.dueDate ? new Date(caseData.dueDate).toLocaleDateString() : 'Immediate';
      result.paymentInstructions = placeholders.paymentInstructions;
      result.creditorName = client.name;
      break;
  }

  // Final Pass: Ensure no keys are 'undefined' to avoid literal "undefined" in docx
  // We prioritize N/A for missing keys that are expected but weren't filled
  Object.keys(result).forEach(key => {
    if (result[key] === undefined || result[key] === null) {
      result[key] = '[N/A]';
    }
  });

  return result;
}
