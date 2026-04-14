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
- **Document Engine**: `docxtemplater` for DOCX rendering, `libreoffice-convert` for PDF generation.

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

## 🔄 Data Flow: Generation Process

1. **Request**: User selects a template version and provides a Case ID.
2. **Queue**: API creates a `GeneratedDocument` record (status: `QUEUED`) and enqueues a job in Redis.
3. **Processing**: Worker picks up the job, fetches case data from the `CasesService`, and downloads the template from S3.
4. **Rendering**: `docxtemplater` merges case data into the DOCX template.
5. **Conversion**: If PDF is requested, the worker converts the DOCX buffer using LibreOffice.
6. **Persistence**: Final file is uploaded to S3; DB record is updated to `COMPLETED`.
7. **Delivery**: Frontend polls for status and provides a secure download link upon completion.

## 🛡 Security & RBAC

Access is controlled via a custom `RolesGuard` in the NestJS API:
- **Admin**: Full system access, including template creation and publishing.
- **Lawyer**: Can manage templates and trigger preview/final generations.
- **Partner**: Read-only access to templates and generated documents.

## ⚠️ Risks & Mitigations

- **Conversion Latency**: PDF conversion is a heavy process. **Mitigation**: Offloaded to background workers with configurable concurrency.
- **Template Corruption**: Invalid DOCX files can crash rendering. **Mitigation**: Background validation worker checks file integrity upon upload.
- **Data Consistency**: Case data might change during generation. **Mitigation**: Case data is fetched at the start of the worker process to ensure a point-in-time snapshot.

## 🛠 Development & Demo Notes

- **Environment**: The system is configured for a containerized environment with PostgreSQL, Redis, and S3.
- **Authentication**: For this demo, a mock authentication layer is used to simulate different roles.
- **PDF Conversion**: Requires `libreoffice` to be installed in the environment where the worker runs.

---
*This project was developed as a technical submission for the Legal Document Constructor requirements.*
