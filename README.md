# Cassatix - Legal Document Constructor

Cassatix is a modular document construction system designed for legal professionals. It enables the management of complex document templates, version control, and automated document generation (DOCX/PDF) integrated with case data.

## 🏗 Architecture Overview

The project follows a **Modular Monolith** architecture within a monorepo, separating concerns between the user interface, API orchestration, and heavy background processing.

### Module Boundaries
- **Web App (`apps/web`)**: A React-based SPA for admins and lawyers to manage templates and trigger generations.
- **API Server (`apps/api`)**: A NestJS server handling business logic, RBAC, audit logging, and job orchestration.
- **Background Worker (`apps/worker`)**: A dedicated service for CPU-intensive tasks like DOCX rendering and PDF conversion.
- **Shared Package (`packages/shared`)**: Common types, constants, and utilities used across all services.

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, TanStack Query, Radix UI.
- **Backend**: NestJS, Prisma (PostgreSQL), BullMQ (Redis).
- **Storage**: S3-compatible storage for template files and generated documents.
- **Document Engine**: `docxtemplater` for DOCX rendering, `libreoffice-convert` (LibreOffice) for PDF generation.

## 📋 Feature Mapping

| Requirement | Implementation Status | Technical Detail |
| :--- | :--- | :--- |
| **Template Management** | ✅ Implemented | CRUD for templates with categorization and case-type mapping. |
| **Versioning** | ✅ Implemented | Immutable version history with draft/published/archived states. |
| **File Upload** | ✅ Implemented | S3-backed storage for `.docx` template files. |
| **Validation** | ✅ Implemented | Automated background validation of template variables and structure. |
| **Document Generation** | ✅ Implemented | Asynchronous generation using BullMQ to prevent API blocking. |
| **Word/PDF Support** | ✅ Implemented | Native DOCX rendering + LibreOffice-based PDF conversion. |
| **Audit Logging** | ✅ Implemented | Detailed trail of all administrative and generation actions. |
| **RBAC** | ✅ Implemented | Role-based access (Admin, Lawyer, Partner) enforced at API level. |
| **Logic Management** | ✅ Implemented | Visual Schema Editor for managing variables and conditional logic. |

## 📊 Data Model and Flow

### Core Entities
- **Template**: The top-level document definition (e.g., "Standard NDA").
- **TemplateVersion**: An immutable snapshot of a template, containing the `.docx` file reference, variable schema, and conditions.
- **GeneratedDocument**: A record of a specific generation request, tracking status, output format, and storage location.
- **AuditLog**: A persistent record of all state-changing actions (e.g., `PUBLISH_VERSION`, `FINAL_GENERATION_REQUESTED`).

### Generation Flow
1. **Trigger**: User selects a `TemplateVersion` and provides a `caseId`.
2. **Persistence**: API creates a `GeneratedDocument` (status: `QUEUED`).
3. **Job**: A job is added to the `DOCUMENT_GENERATION_QUEUE` (Redis/BullMQ).
4. **Processing**: Worker fetches case data, downloads the template from S3, and renders the DOCX.
5. **Conversion**: If the requested format is PDF, the worker invokes LibreOffice for conversion.
6. **Storage**: The resulting file is uploaded to S3.
7. **Completion**: The `GeneratedDocument` status is updated to `COMPLETED` with the `storagePath`.

## 🛡 Security & RBAC

Access is controlled via a custom `RolesGuard` in the NestJS API:
- **Admin**: Full system access, including template creation and publishing.
- **Lawyer**: Can manage templates and trigger preview/final generations.
- **Partner**: Read-only access to templates and generated documents.

## ⚠️ Risks and Failure Modes

- **Invalid/Corrupted Templates**: Uploading a malformed `.docx` can break the rendering engine. 
  - *Mitigation*: Background validation worker checks file integrity and variable syntax immediately after upload.
- **Generation Failures**: Network issues or service outages can interrupt document rendering.
  - *Mitigation*: BullMQ provides automatic retries with exponential backoff. Status is tracked as `FAILED` with error messages surfaced to the UI.
- **Version Conflicts**: Attempting to publish an archived version or delete a published one.
  - *Mitigation*: Strict state machine transitions enforced in `TemplateVersionsService`.
- **Storage/Queue Failures**: S3 or Redis unavailability.
  - *Mitigation*: Health checks and graceful error handling in the API layer; jobs remain in the queue until the worker is available.
- **Permission Leaks**: Unauthorized access to sensitive legal documents.
  - *Mitigation*: RBAC enforced at every API endpoint; signed URLs or proxied downloads ensure storage remains private.

## 🚧 Current Constraints and Known Limitations

- **Mock Authentication**: The current implementation uses a development-only mock auth layer. Production deployment requires integration with a real identity provider (e.g., Auth0, Firebase Auth).
- **Environment Dependencies**: PDF conversion relies on a local LibreOffice installation. In production, this requires a specific container image (e.g., `linuxserver/libreoffice`).
- **Logic UX**: While a Visual Schema Editor is provided, it currently supports basic JSON Schema properties. Complex nested logic still requires manual JSON refinement in "Code" mode.
- **Demo Scope**: The system is optimized for a "Modular Monolith" demo. High-scale production would benefit from splitting the Worker into multiple specialized microservices.

---
*This project was developed as a technical submission for the Legal Document Constructor requirements.*
