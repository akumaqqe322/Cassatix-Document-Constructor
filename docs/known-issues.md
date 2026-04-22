# Known Issues & Limitations - Cassatix

This document provides an honest assessment of the current prototype's constraints and known rough edges.

---

## 🛠 Prototype Constraints

### 🔑 Mock Authentication
- **Current State**: Auth is handled via the `x-user-id` header.
- **Limitation**: There is no password hashing, token expiration, or secure session management.
- **Security Warning**: This mechanism is for rapid prototyping only and must never be exposed to a public network without a JWT/OIDC layer.

### 🏠 Local Infrastructure Dependencies
- **Worker Binaries**: PDF conversion relies on `libreoffice` being installed on the host environment. Failing to find the binary will cause generation jobs to fail.
- **S3 Connectivity**: The system defaults to local MinIO. In unstable network environments, large `.docx` uploads may time out.

---

## 🏗 Logical Limitations

### 🤖 AI Extraction Variance
- **Issue**: Gemini AI extraction is non-deterministic. The same input text may result in slightly different variable mappings if the prompt is not strictly constrained.
- **Impact**: Some extracted fields might not match template placeholders exactly (e.g., `client_name` vs `clientName`), requiring manual reconciliation in the UI.

### 📁 Document Assembly
- **Issue**: Complex nested logic (nested loops/conditionals) in `.docx` files is currently limited to the capabilities of the `docxtemplater` configuration.
- **Constraint**: Deep specific document schemas (e.g., complex tables) may require manual template tuning.

---

## 🚀 Common Failure Modes

1. **Stalled Jobs**: A worker crash mid-processing may leave a document in a `PROCESSING` state.
   - *Mitigation*: Manually retry via API or flush the Redis queue.
2. **Context Miss**: Generating from a `.docx` with variables missing in the Case data.
   - *Mitigation*: Use the **Preview** flow to identify gaps before final generation.

---

## 🔗 Related Documentation
- [Demo & Testing Flow](./demo-flow.md)
- [Architecture Overview](./architecture.md)
- [Back to README](../README.md)
