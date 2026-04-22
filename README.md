# Cassatix: Legal Document Automation Platform

Cassatix is an enterprise-grade document automation and orchestration platform purpose-built for high-stakes legal workflows. It replaces unstable local "template drifting" with a centralized, version-controlled, and audited system for high-throughput legal instrument generation.

---

## 🏛 Project Status: Functional Prototype
Cassatix is currently in a **Functional Prototype (MVP)** phase. It implements the full content lifecycle from template drafting to background PDF generation. 

> [!IMPORTANT]
> For speed of evaluation, this prototype uses a **Mock Identity Mechanism** (`x-user-id` header) for local RBAC simulation rather than a production OIDC provider.

---

## 🗺 Where to Start

If you are a reviewer, follow this path to understand the system:

1.  **[Demo & Testing Flow](./docs/demo-flow.md)**: Start here for a guided walkthrough of the Lawyer, Partner, and Admin personas.
2.  **[Architecture Overview](./docs/architecture.md)**: Read this to understand how we decouple API orchestration from worker-based document assembly.
3.  **[API Overview](./docs/api-overview.md)**: Explore the REST structure and the role-based security model.

---

## ✨ Core Capabilities

- **Immutable Versioning**: A strict `DRAFT` → `PUBLISHED` lifecycle ensures production documents always use verified, audited content.
- **Contextual Generation**: Populate documents using real-time Case data, AI-extracted structured entities, or manual overrides.
- **Distributed Automation**: Offloads intensive Word assembly and PDF conversion to a resilient, Redis-backed worker pool.
- **Firm Governance**: Role-Based Access Control (RBAC) paired with a comprehensive system-wide Audit Log.

---

## 🏗 High-Level Stack

Cassatix is built on a modern, distributed architecture:
- **Frontend**: React 19 SPA + Vite + Tailwind CSS.
- **Backend**: NestJS (TypeScript) Gateway & Metadata Orchestrator.
- **Worker**: Headless Node.js Service (BullMQ) for document assembly chores.
- **Persistence**: PostgreSQL (State), Redis (Queue), S3 (File Storage).

---

## 🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Synchronize database and seed demo data
npx prisma migrate dev
npx prisma db seed

# 3. Launch the full-stack environment
npm run dev
```

---
*Cassatix – Precision Legality through Automation.*
