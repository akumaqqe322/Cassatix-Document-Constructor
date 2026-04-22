# Demo & Testing Flow - Cassatix

This guide provides a walkthrough for reviewers to evaluate the core functionality of Cassatix.

---

## 🎭 Persona: The Lawyer (Design)
1.  **Define Intent**: Create a new Template record (e.g., "Non-Disclosure Agreement").
2.  **Iterate**: Create a `v1` draft and upload a `.docx` containing `{{clientName}}` and `{{effectiveDate}}`.
3.  **Validate**: Promote the version to **PUBLISHED**.

---

## 🎭 Persona: The Partner (Production)
1.  **Select Context**: Identify an active litigation matter in the "Cases" list.
2.  **Execute**: Click "Generate Document" and choose the "NDA" template.
3.  **Bridge Sourcing**: Select **"Link to Case"** to pull live data from the simulated firm database.

---

## ✅ Success State
- The document status transitions from `QUEUED` to `COMPLETED`.
- The final PDF accurately replaces variables with case management data (e.g., "MegaCorp").
- A permanent, immutable record is generated in the **Audit Logs**.

---

## 🎭 Persona: The Admin (Governance)

1.  **System Health**: Check the Dashboard for aggregate generation stats.
2.  **Compliance**: Visit the "Audit Logs" to see the chronological history of who promoted a specific template version and who generated the final client PDF.

---

## 🔗 Related Documentation
- [Known Issues](./known-issues.md)
- [Architecture Overview](./architecture.md)
- [API Overview](./api-overview.md)
- [Back to README](../README.md)
