# API Reference - Cassatix Gateway

This document provides a technical overview of the Cassatix REST API. The API is a NestJS-powered gateway that orchestrates metadata and enforces firm-wide security policies.

---

## 🔐 Identity & Access (Prototype)

In the current prototype, authentication is simulated via a **Mock Identity Header**.
- **Header**: `x-user-id`
- **Logic**: The `RolesGuard` resolves the actor from the database using this ID to enforce RBAC.

### Firm Roles
| Role | Primary Responsibility | Key Permissions |
| :--- | :--- | :--- |
| **admin** | Governance & Oversight | Audit logs, system health, and lifecycle management. |
| **lawyer** | Content Design | Drafting templates, versioning, and testing previews. |
| **partner** | Execution | Case-linked generation and final client document retrieval. |

---

## 📂 Logical Endpoint Groups

### 🏛 Template Management (`/api/templates`)
Manage the high-level legal instrument definitions.
- `GET /`: List templates with optional filtering.
- `POST /`: Create a new template definition (Admin/Lawyer).
- `GET /:id`: Retrieve specific template metadata.
- `PATCH /:id`: Update template configuration.

### 🔄 Template Versioning (`/api/templates/:id/versions`)
Manages the actual content and lifecycle of document versions.
- `POST /`: Create a new draft version.
- `POST /:versionId/file`: Upload the physical `.docx` template.
- `POST /:versionId/publish`: Promote a version to "Live" status.
- `POST /:versionId/preview`: Trigger an asynchronous preview generation.
- `POST /:versionId/generate`: Trigger an asynchronous final document generation.

### 📁 Legal Cases (`/api/cases`)
Provides the business context for document generation.
- `GET /`: List active cases from the source system.
- `GET /:id`: Retrieve detailed party and case data.
- `GET /:id/context`: Get normalized data variables for template population.

### 📄 Generated Documents (`/api/documents`)
Access to finished or processing artifacts.
- `GET /`: List all generation history.
- `GET /:id`: Check processing status and metadata.
- `GET /:id/download`: Secure redirect to the binary artifact in S3.

### 🤖 Intelligent Assistance (`/api/ai`)
- `POST /extract`: Send raw text/notes to receive structured JSON for template fields.

---

## 🚨 Response Conventions
- **200 OK**: Successful retrieval/update.
- **201 Created**: Successful resource creation.
- **202 Accepted**: Background job (generation) has been queued.
- **401/403**: Authentication/Authorization failure.
- **404**: Resource not found.

---

## 🔗 Related Documentation
- [Architecture Overview](./architecture.md)
- [Data Model](./data-model.md)
- [Back to README](../README.md)
