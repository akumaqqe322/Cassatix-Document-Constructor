import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { TemplateVersionStatus, Prisma, ValidationStatus } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { TemplateValidationQueueService } from './template-validation-queue.service';

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
  ) {}

  async create(templateId: string, dto: CreateTemplateVersionDto, actorId: string) {
    // Verify template exists
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    // Get latest version number
    const latestVersion = await this.prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    return this.prisma.templateVersion.create({
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
      throw new NotFoundException(`Template version with ID ${versionId} not found for template ${templateId}`);
    }

    return version;
  }

  async uploadFile(templateId: string, versionId: string, file: Express.Multer.File) {
    const version = await this.findById(templateId, versionId);

    if (version.status === TemplateVersionStatus.ARCHIVED) {
      throw new BadRequestException('Cannot upload file to an archived version');
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

    await this.validationQueue.enqueueValidation(templateId, versionId);

    return updatedVersion;
  }

  async publish(templateId: string, versionId: string) {
    const version = await this.findById(templateId, versionId);

    if (version.status === TemplateVersionStatus.ARCHIVED) {
      throw new BadRequestException('Cannot publish an archived version');
    }

    if (version.status === TemplateVersionStatus.PUBLISHED) {
      return version; // Already published
    }

    return this.prisma.$transaction(async (tx) => {
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
  }

  async archive(templateId: string, versionId: string) {
    const version = await this.findById(templateId, versionId);

    return this.prisma.$transaction(async (tx) => {
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
  }
}
