import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { TemplateVersionStatus, Prisma, ValidationStatus, GenerationType, DocumentStatus, OutputFormat } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { TemplateValidationQueueService } from './template-validation-queue.service';
import { DocumentGenerationQueueService } from './document-generation-queue.service';
import { CasesService } from '../cases/cases.service';
import { AuditService } from '../audit/audit.service';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

@Injectable()
export class TemplateVersionsService {
  private readonly userSelect = {
    select: {
      id: true,
      name: true,
      email: true,
    },
  } as const;

  private readonly detailsInclude = {
    createdBy: this.userSelect,
  } as const;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private validationQueue: TemplateValidationQueueService,
    private generationQueue: DocumentGenerationQueueService,
    private casesService: CasesService,
    private auditService: AuditService,
  ) {}

  async create(templateId: string, dto: CreateTemplateVersionDto, actorId: string) {
    // Verify template exists
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new DomainException(
        `Template with ID ${templateId} not found`,
        ErrorCode.TEMPLATE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    // Get latest version number
    const latestVersion = await this.prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    const version = await this.prisma.templateVersion.create({
      data: {
        changelog: dto.changelog,
        variablesSchemaJson: dto.variablesSchemaJson as Prisma.InputJsonValue,
        conditionsSchemaJson: dto.conditionsSchemaJson as Prisma.InputJsonValue,
        versionNumber: nextVersionNumber,
        status: TemplateVersionStatus.DRAFT,
        template: { connect: { id: templateId } },
        createdBy: { connect: { id: actorId } },
      },
      include: this.detailsInclude,
    });

    await this.auditService.record({
      entityType: 'TEMPLATE_VERSION',
      entityId: version.id,
      action: 'VERSION_CREATED',
      actorId,
      metadata: { templateId, versionNumber: version.versionNumber },
    });

    return version;
  }

  async findAll(templateId: string) {
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
      include: this.detailsInclude,
    });
  }

  async findById(templateId: string, versionId: string) {
    const version = await this.prisma.templateVersion.findUnique({
      where: { id: versionId },
      include: {
        ...this.detailsInclude,
        template: true,
      },
    });

    if (!version || version.templateId !== templateId) {
      throw new DomainException(
        `Template version with ID ${versionId} not found for template ${templateId}`,
        ErrorCode.VERSION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return version;
  }

  async uploadFile(templateId: string, versionId: string, file: Express.Multer.File, actorId: string) {
    const version = await this.findById(templateId, versionId);

    if (version.status === TemplateVersionStatus.ARCHIVED) {
      throw new DomainException(
        'Cannot upload file to an archived version',
        ErrorCode.FORBIDDEN_ACTION
      );
    }

    const storagePath = `templates/${templateId}/versions/${versionId}/${file.originalname}`;

    await this.storageService.upload({
      key: storagePath,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    const updatedVersion = await this.prisma.templateVersion.update({
      where: { id: versionId },
      data: {
        storagePath,
        fileName: file.originalname,
        validationStatus: ValidationStatus.PENDING,
      },
      include: this.detailsInclude,
    });

    await this.auditService.record({
      entityType: 'TEMPLATE_VERSION',
      entityId: versionId,
      action: 'FILE_UPLOADED',
      actorId,
      metadata: { fileName: file.originalname, templateId },
    });

    await this.validationQueue.enqueueValidation(templateId, versionId);

    return updatedVersion;
  }

  async generatePreview(templateId: string, versionId: string, caseId: string | null, actorId: string, outputFormat: OutputFormat = OutputFormat.DOCX, customVariables?: Record<string, any>) {
    const version = await this.findById(templateId, versionId);

    // 1. Verify version is ready for generation
    if (!version.storagePath) {
      throw new DomainException(
        'Template version has no file uploaded',
        ErrorCode.TEMPLATE_FILE_MISSING
      );
    }

    if (version.validationStatus !== ValidationStatus.VALID) {
      throw new DomainException(
        `Template version is not in a valid state (current: ${version.validationStatus})`,
        ErrorCode.TEMPLATE_NOT_VALIDATED
      );
    }

    // 2. Verify case exists if caseId is provided
    if (caseId) {
      await this.casesService.getCaseData(caseId);
    } else if (!customVariables) {
      throw new DomainException(
        'Either caseId or customVariables must be provided',
        ErrorCode.INCOMPLETE_CASE_DATA
      );
    }

    // 3. Create GeneratedDocument record and enqueue job
    const doc = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.generatedDocument.create({
        data: {
          templateId,
          templateVersionId: versionId,
          caseId,
          requestedById: actorId,
          generationType: GenerationType.PREVIEW,
          outputFormat,
          status: DocumentStatus.QUEUED,
        },
      });

      await this.generationQueue.enqueuePreview(templateId, versionId, caseId, doc.id, outputFormat, customVariables);

      return doc;
    });

    await this.auditService.record({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'PREVIEW_REQUESTED',
      actorId,
      metadata: { templateId, versionId, caseId, hasCustomVariables: !!customVariables },
    });

    return doc;
  }

  async generateFinal(templateId: string, versionId: string, caseId: string | null, actorId: string, outputFormat: OutputFormat = OutputFormat.DOCX, customVariables?: Record<string, any>) {
    const version = await this.findById(templateId, versionId);

    // 1. Verify version is ready for generation
    if (!version.storagePath) {
      throw new DomainException(
        'Template version has no file uploaded',
        ErrorCode.TEMPLATE_FILE_MISSING
      );
    }

    if (version.validationStatus !== ValidationStatus.VALID) {
      throw new DomainException(
        `Template version is not in a valid state (current: ${version.validationStatus})`,
        ErrorCode.TEMPLATE_NOT_VALIDATED
      );
    }

    // 2. Verify version is PUBLISHED and is the current published version of the template
    if (version.status !== TemplateVersionStatus.PUBLISHED) {
      throw new DomainException(
        'Only published versions can be used for final generation',
        ErrorCode.FORBIDDEN_ACTION
      );
    }

    if (version.template.publishedVersionId !== versionId) {
      throw new DomainException(
        'This version is not the current published version for this template',
        ErrorCode.FORBIDDEN_ACTION
      );
    }

    // 3. Verify case exists if caseId is provided
    if (caseId) {
      await this.casesService.getCaseData(caseId);
    } else if (!customVariables) {
      throw new DomainException(
        'Either caseId or customVariables must be provided',
        ErrorCode.INCOMPLETE_CASE_DATA
      );
    }

    // 4. Create GeneratedDocument record and enqueue job
    const doc = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.generatedDocument.create({
        data: {
          templateId,
          templateVersionId: versionId,
          caseId,
          requestedById: actorId,
          generationType: GenerationType.FINAL,
          outputFormat,
          status: DocumentStatus.QUEUED,
        },
      });

      await this.generationQueue.enqueueFinal(templateId, versionId, caseId, doc.id, outputFormat, customVariables);

      return doc;
    });

    await this.auditService.record({
      entityType: 'DOCUMENT',
      entityId: doc.id,
      action: 'FINAL_GENERATION_REQUESTED',
      actorId,
      metadata: { templateId, versionId, caseId, hasCustomVariables: !!customVariables },
    });

    return doc;
  }

  async publish(templateId: string, versionId: string, actorId: string) {
    const version = await this.findById(templateId, versionId);

    if (version.status === TemplateVersionStatus.ARCHIVED) {
      throw new DomainException(
        'Cannot publish an archived version',
        ErrorCode.FORBIDDEN_ACTION
      );
    }

    if (version.validationStatus !== ValidationStatus.VALID) {
      throw new DomainException(
        `Cannot publish a version that has not passed validation (current status: ${version.validationStatus})`,
        ErrorCode.TEMPLATE_NOT_VALIDATED
      );
    }

    if (version.status === TemplateVersionStatus.PUBLISHED) {
      return version; // Already published
    }

    const updatedVersion = await this.prisma.$transaction(async (tx) => {
      // 1. Set all other PUBLISHED versions of this template to ARCHIVED
      await tx.templateVersion.updateMany({
        where: {
          templateId,
          status: TemplateVersionStatus.PUBLISHED,
          id: { not: versionId },
        },
        data: {
          status: TemplateVersionStatus.ARCHIVED,
        },
      });

      // 2. Update this version to PUBLISHED
      const updatedVersion = await tx.templateVersion.update({
        where: { id: versionId },
        data: {
          status: TemplateVersionStatus.PUBLISHED,
          publishedAt: new Date(),
        },
        include: this.detailsInclude,
      });

      // 3. Update template's publishedVersionId
      await tx.template.update({
        where: { id: templateId },
        data: {
          publishedVersionId: versionId,
        },
      });

      return updatedVersion;
    });

    await this.auditService.record({
      entityType: 'TEMPLATE_VERSION',
      entityId: versionId,
      action: 'VERSION_PUBLISHED',
      actorId,
      metadata: { templateId, versionNumber: version.versionNumber },
    });

    return updatedVersion;
  }

  async archive(templateId: string, versionId: string, actorId: string) {
    const version = await this.findById(templateId, versionId);

    const updatedVersion = await this.prisma.$transaction(async (tx) => {
      const updatedVersion = await tx.templateVersion.update({
        where: { id: versionId },
        data: {
          status: TemplateVersionStatus.ARCHIVED,
        },
        include: this.detailsInclude,
      });

      // If this was the published version, clear it from the template
      const template = await tx.template.findUnique({
        where: { id: templateId },
      });

      if (template?.publishedVersionId === versionId) {
        await tx.template.update({
          where: { id: templateId },
          data: {
            publishedVersionId: null,
          },
        });
      }

      return updatedVersion;
    });

    await this.auditService.record({
      entityType: 'TEMPLATE_VERSION',
      entityId: versionId,
      action: 'VERSION_ARCHIVED',
      actorId,
      metadata: { templateId, versionNumber: version.versionNumber },
    });

    return updatedVersion;
  }

  async findDocuments(templateId: string, versionId: string) {
    await this.findById(templateId, versionId); // Validate existence
    
    return this.prisma.generatedDocument.findMany({
      where: {
        templateId,
        templateVersionId: versionId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: this.userSelect,
      },
    });
  }
}
