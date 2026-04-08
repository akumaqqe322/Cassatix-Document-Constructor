-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "publishedVersionId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_publishedVersionId_fkey" FOREIGN KEY ("publishedVersionId") REFERENCES "TemplateVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Template_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Template" ("caseType", "category", "code", "createdAt", "createdById", "id", "name", "publishedVersionId", "status", "updatedAt") SELECT "caseType", "category", "code", "createdAt", "createdById", "id", "name", "publishedVersionId", "status", "updatedAt" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
CREATE UNIQUE INDEX "Template_code_key" ON "Template"("code");
CREATE INDEX "Template_code_idx" ON "Template"("code");
CREATE INDEX "Template_status_idx" ON "Template"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
