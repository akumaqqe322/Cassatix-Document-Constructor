/*
  Warnings:

  - You are about to drop the column `documentType` on the `Template` table. All the data in the column will be lost.
  - Added the required column `category` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "TemplateVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("caseType", "code", "createdAt", "createdById", "id", "name", "publishedVersionId", "status", "updatedAt") SELECT "caseType", "code", "createdAt", "createdById", "id", "name", "publishedVersionId", "status", "updatedAt" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE UNIQUE INDEX "Template_code_key" ON "Template"("code");
CREATE UNIQUE INDEX "Template_publishedVersionId_key" ON "Template"("publishedVersionId");
CREATE INDEX "Template_code_idx" ON "Template"("code");
CREATE INDEX "Template_status_idx" ON "Template"("status");
CREATE TABLE "new_TemplateVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "storagePath" TEXT,
    "fileName" TEXT,
    "variablesSchemaJson" JSONB,
    "conditionsSchemaJson" JSONB,
    "changelog" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TemplateVersion" ("changelog", "conditionsSchemaJson", "createdAt", "createdById", "fileName", "id", "publishedAt", "status", "storagePath", "templateId", "variablesSchemaJson", "versionNumber") SELECT "changelog", "conditionsSchemaJson", "createdAt", "createdById", "fileName", "id", "publishedAt", "status", "storagePath", "templateId", "variablesSchemaJson", "versionNumber" FROM "TemplateVersion";
DROP TABLE "TemplateVersion";
ALTER TABLE "new_TemplateVersion" RENAME TO "TemplateVersion";
CREATE INDEX "TemplateVersion_templateId_idx" ON "TemplateVersion"("templateId");
CREATE INDEX "TemplateVersion_status_idx" ON "TemplateVersion"("status");
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
