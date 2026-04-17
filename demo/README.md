# Cassatix Demo Templates Kit

This directory contains real, valid `.docx` templates for testing the Cassatix document generation pipeline.

## Contents

- `*.docx`: Real Word document templates with standard `{{variable}}` placeholders.
- `metadata/*.json`: Metadata for each template (name, code, category, variables schema).

## Included Templates

1. **Power of Attorney** (`poa.docx`)
   - Category: Authorization
   - Placeholders: `grantorName`, `grantorAddress`, `effectiveDate`, `agentName`, `agentAddress`, `powersDescription`, `expiryDate`, `signingLocation`

2. **Statement of Claim** (`claim.docx`)
   - Category: Litigation
   - Placeholders: `claimantName`, `defendantName`, `incidentDate`, `incidentLocation`, `damageDescription`, `claimAmount`, `currency`, `lawyerName`, `issueDate`

3. **Service Agreement** (`agreement.docx`)
   - Category: Commercial
   - Placeholders: `partyAName`, `partyBName`, `contractDate`, `serviceDescription`, `paymentAmount`, `termDuration`, `terminationNoticePeriod`, `governingLaw`

4. **Demand Letter** (`demand.docx`)
   - Category: Collection
   - Placeholders: `letterDate`, `recipientName`, `recipientAddress`, `debtAmount`, `dueDate`, `paymentInstructions`, `creditorName`

## How to use

1. **Upload**: Use the Cassatix UI to create a new Template.
2. **Setup**: Use the values from the corresponding `.json` file in `metadata/` for the name, code, and variables.
3. **File Version**: Create a new Version and upload the `.docx` file.
4. **Validation**: The system will automatically run the validation worker. It should now pass with `VALID` status.
5. **Publish**: Once valid, publish the version.
6. **Generate**: Use the "Generate Preview" or "Generate Final" features with test data matching the schema.

## Regeneration

If you need to change the template content or structure, edit `scripts/generate-demo-templates.ts` and run:

```bash
npx tsx scripts/generate-demo-templates.ts
```

This ensures templates are always valid DOCX files generated programmatically, avoiding binary corruption issues.
