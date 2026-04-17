
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'demo/templates');
const METADATA_DIR = path.join(OUTPUT_DIR, 'metadata');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(METADATA_DIR)) fs.mkdirSync(METADATA_DIR, { recursive: true });

interface TemplateDef {
  id: string;
  name: string;
  code: string;
  category: string;
  caseType: string;
  description: string;
  content: string[];
  schema: Record<string, string>;
}

const templates: TemplateDef[] = [
  {
    id: 'poa',
    name: 'Power of Attorney',
    code: 'POW-ATT-001',
    category: 'Authorization',
    caseType: 'General',
    description: 'A standard General Power of Attorney template.',
    content: [
      'GENERAL POWER OF ATTORNEY',
      '',
      'This Power of Attorney is given by me, {{grantorName}}, residing at {{grantorAddress}}, on this date {{effectiveDate}}.',
      '',
      'I hereby appoint {{agentName}}, residing at {{agentAddress}}, as my attorney-in-fact (the "Agent") to act for me in my name and stead.',
      '',
      'Authority:',
      'The Agent shall have the power to: {{powersDescription}}.',
      '',
      'Duration:',
      'This Power of Attorney shall remain in effect until {{expiryDate}}, unless revoked earlier in writing.',
      '',
      'Signed at {{signingLocation}} on {{effectiveDate}}.',
      '',
      '__________________________',
      '{{grantorName}} (Grantor)'
    ],
    schema: {
      grantorName: 'string',
      grantorAddress: 'string',
      effectiveDate: 'string',
      agentName: 'string',
      agentAddress: 'string',
      powersDescription: 'string',
      expiryDate: 'string',
      signingLocation: 'string'
    }
  },
  {
    id: 'claim',
    name: 'Statement of Claim',
    code: 'CLAIM-GEN-001',
    category: 'Litigation',
    caseType: 'Claim',
    description: 'A formal statement of claim for legal proceedings.',
    content: [
      'STATEMENT OF CLAIM',
      '',
      'Claimant: {{claimantName}}',
      'Defendant: {{defendantName}}',
      '',
      'Statement of Facts:',
      'On or about {{incidentDate}}, at the location {{incidentLocation}}, the following occurred: {{damageDescription}}.',
      '',
      'Relief Sought:',
      'The Claimant requests that the Defendant pay the sum of {{claimAmount}} {{currency}} as compensation for damages.',
      '',
      'Legal Representation:',
      'This statement is submitted by {{lawyerName}} on behalf of the Claimant.',
      '',
      'Date: {{issueDate}}'
    ],
    schema: {
      claimantName: 'string',
      defendantName: 'string',
      incidentDate: 'string',
      incidentLocation: 'string',
      damageDescription: 'string',
      claimAmount: 'number',
      currency: 'string',
      lawyerName: 'string',
      issueDate: 'string'
    }
  },
  {
    id: 'agreement',
    name: 'Service Agreement',
    code: 'AGR-SERV-001',
    category: 'Commercial',
    caseType: 'Agreement',
    description: 'A general service agreement between a client and a provider.',
    content: [
      'SERVICE AGREEMENT',
      '',
      'This Agreement is made between {{partyAName}} ("Client") and {{partyBName}} ("Provider") on {{contractDate}}.',
      '',
      '1. Services:',
      'Provider agrees to perform the following: {{serviceDescription}}.',
      '',
      '2. Compensation:',
      'Client shall pay Provider the total sum of {{paymentAmount}} upon completion of the services.',
      '',
      '3. Term:',
      'This agreement shall be valid for a duration of {{termDuration}}.',
      '',
      '4. Termination:',
      'Either party may terminate with {{terminationNoticePeriod}} notice.',
      '',
      'This contract is governed by the laws of {{governingLaw}}.'
    ],
    schema: {
      partyAName: 'string',
      partyBName: 'string',
      contractDate: 'string',
      serviceDescription: 'string',
      paymentAmount: 'string',
      termDuration: 'string',
      terminationNoticePeriod: 'string',
      governingLaw: 'string'
    }
  },
  {
    id: 'demand',
    name: 'Demand Letter',
    code: 'DEM-PAY-001',
    category: 'Collection',
    caseType: 'Payment',
    description: 'A formal demand for payment for outstanding debts.',
    content: [
      'FORMAL DEMAND FOR PAYMENT',
      '',
      'Date: {{letterDate}}',
      '',
      'To: {{recipientName}}',
      'Address: {{recipientAddress}}',
      '',
      'RE: OUTSTANDING DEBT OF {{debtAmount}}',
      '',
      'Dear {{recipientName}},',
      '',
      'This letter serves as a formal demand for the immediate payment of {{debtAmount}} which was due on {{dueDate}}.',
      '',
      'Please follow these payment instructions: {{paymentInstructions}}.',
      '',
      'If payment is not received by {{dueDate}}, {{creditorName}} reserves the right to take further legal action without notice.',
      '',
      'Sincerely,',
      '',
      '{{creditorName}}'
    ],
    schema: {
      letterDate: 'string',
      recipientName: 'string',
      recipientAddress: 'string',
      debtAmount: 'string',
      dueDate: 'string',
      paymentInstructions: 'string',
      creditorName: 'string'
    }
  }
];

async function generate() {
  console.log('--- Generating Demo Templates ---');

  for (const t of templates) {
    console.log(`Generating ${t.name}...`);

    const children = t.content.map(line => {
      // If the first line or looks like a title, make it a heading
      if (line === line.toUpperCase() && line.length > 5 && !line.includes('{{')) {
        return new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 }
        });
      }
      
      return new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 120 }
      });
    });

    const doc = new Document({
      sections: [{
        children: children
      }]
    });

    // Save DOCX
    const base64 = await Packer.toBase64String(doc);
    const buffer = Buffer.from(base64, 'base64');
    const fileName = `${t.id}.docx`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), buffer);

    // Save Metadata
    const metadata = {
      name: t.name,
      code: t.code,
      category: t.category,
      caseType: t.caseType,
      description: t.description,
      schema: t.schema
    };
    fs.writeFileSync(path.join(METADATA_DIR, `${t.id}.json`), JSON.stringify(metadata, null, 2));

    console.log(`Saved: ${fileName} and ${t.id}.json`);
  }

  console.log('\nDeployment Note:');
  console.log('Templates generated successfully in demo/templates/');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
