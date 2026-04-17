
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import * as fs from 'node:fs/promises';
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';

const OUTPUT_DIR = path.join(process.cwd(), 'demo/templates');
const METADATA_DIR = path.join(OUTPUT_DIR, 'metadata');

// Ensure directories exist and are clean
if (existsSync(OUTPUT_DIR)) {
  console.log(`Cleaning old templates in ${OUTPUT_DIR}...`);
  const oldFiles = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.docx'));
  oldFiles.forEach(f => unlinkSync(path.join(OUTPUT_DIR, f)));
} else {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

if (!existsSync(METADATA_DIR)) mkdirSync(METADATA_DIR, { recursive: true });

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

    // 1. Generate Binary DOCX (Explicitly as Buffer/Uint8Array)
    const docxUint8 = await Packer.toBuffer(doc);
    
    // 2. Immediate Integrity Check (Binary Level)
    if (docxUint8[0] !== 0x50 || docxUint8[1] !== 0x4B || docxUint8[2] !== 0x03 || docxUint8[3] !== 0x04) {
      throw new Error(`[GENERATION_CORRUPTION] Invalid DOCX signature for ${t.id}. Expected 504b0304.`);
    }

    // 3. Scan for UTF-8 corruption markers (EF BF BD)
    const hexFull = Buffer.from(docxUint8.buffer, docxUint8.byteOffset, docxUint8.byteLength).toString('hex');
    if (hexFull.includes('efbfbd')) {
      throw new Error(`[GENERATION_CORRUPTION] UTF-8 expansion detected in ${t.id} immediately after generation.`);
    }

    const fileName = `${t.id}.docx`;
    const fullPath = path.join(OUTPUT_DIR, fileName);
    
    // 4. Atomic Binary Write (No string conversion)
    await fs.writeFile(fullPath, docxUint8);

    // 5. Binary Integrity & Structural Validation
    const verifyBuffer = await fs.readFile(fullPath);
    
    // a. Basic size guards (1B - 200KB)
    if (verifyBuffer.length === 0) {
      throw new Error(`[WRITE_CORRUPTION] Generated file ${fileName} is empty.`);
    }
    if (verifyBuffer.length > 200 * 1024) {
      throw new Error(`[WRITE_CORRUPTION] Generated file ${fileName} exceeds demo limit (200KB). Size: ${verifyBuffer.length}`);
    }

    // b. Header signature check
    if (verifyBuffer[0] !== 0x50 || verifyBuffer[1] !== 0x4B || verifyBuffer[2] !== 0x03 || verifyBuffer[3] !== 0x04) {
      throw new Error(`[WRITE_CORRUPTION] Invalid ZIP signature in ${fileName}.`);
    }

    // c. UTF-8 corruption scan (EF BF BD)
    if (verifyBuffer.toString('hex').includes('efbfbd')) {
      throw new Error(`[WRITE_CORRUPTION] Binary corruption (UTF-8 expansion) detected in ${fileName}.`);
    }

    // d. Structural validity check (can be opened as ZIP)
    try {
      const PizZip = (await import('pizzip')).default;
      const zip = new PizZip(verifyBuffer);
      if (!zip.file('word/document.xml')) {
        throw new Error('Missing word/document.xml - invalid DOCX structure.');
      }
    } catch (zipErr: any) {
      throw new Error(`[STRUCTURAL_ERROR] ${fileName} is not a valid DOCX container: ${zipErr.message}`);
    }

    // Save Metadata
    const metadata = {
      name: t.name,
      code: t.code,
      category: t.category,
      caseType: t.caseType,
      description: t.description,
      schema: t.schema
    };
    await fs.writeFile(path.join(METADATA_DIR, `${t.id}.json`), JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(`Saved: ${fileName} and ${t.id}.json`);
  }

  console.log('\nDeployment Note:');
  console.log('Templates generated successfully in demo/templates/');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
