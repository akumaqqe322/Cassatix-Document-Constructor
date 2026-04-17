# 🚀 Document Generation Demo Guide

This guide provides everything you need to test the three document generation modes implemented in the system.

## 1. Demo Templates
The following templates have been pre-configured in the system:

| Template Name | Code | Category | Key Variables |
| :--- | :--- | :--- | :--- |
| **Power of Attorney** | `POA-001` | LEGAL | `{{clientName}}`, `{{caseNumber}}`, `{{openingDate}}` |
| **Claim Statement** | `CLM-001` | LITIGATION | `{{clientName}}`, `{{caseNumber}}`, `{{courtName}}`, `{{registryRef}}` |
| **Service Agreement** | `AGR-001` | CONTRACT | `{{clientName}}`, `{{contractId}}`, `{{amountFormatted}}` |
| **Demand Letter** | `DL-001` | NOTICE | `{{clientName}}`, `{{caseNumber}}`, `{{amountFormatted}}` |

## 2. Test Modes

### Mode A: From Existing Case (Project 2.0)
1. In the **Generate Document** dialog, select **Existing Case**.
2. Search for "Acme" or "TechFlow".
3. Select a case. The system will automatically use the normalized data from the fake Project 2.0 source.

### Mode B: Document AI Extraction
1. Select **Document AI**.
2. Upload a document or copy/paste text from `demo-extraction-input.txt`.
3. The AI (Gemini) will extract fields like `clientName`, `caseNumber`, and `amountFormatted`.
4. Review and edit the extracted fields in the form before proceeding.

### Mode C: Manual Entry
1. Select **Manual Entry**.
2. Type in any values you want to see in the final document.
3. This mode offers full control over every variable used by the demo templates.

## 3. Sample Case Data
The "Project 2.0" adapter provides these high-quality mock cases:
- **Case 123**: Acme Corporation International (Commercial Litigation)
- **Case 456**: John Quincy Doe (Family Dissolution)
- **Case 789**: TechFlow Solutions Ltd (Corporate M&A)

## 4. Troubleshooting
- **Template Content**: Since these are demo templates, they generate documents based on a minimal `.docx` structure. In a production environment, you would upload real branded `.docx` files with complex styling.
- **AI Extraction**: Ensure the `GEMINI_API_KEY` is configured in your environment for the AI extraction to function.
