import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { TemplateVersionStatus, Prisma } from '@prisma/client';

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

  constructor(private prisma: PrismaService) {}

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
        ...dto,
        templateId,
        versionNumber: nextVersionNumber,
        createdById: actorId,
        status: TemplateVersionStatus.DRAFT,
      },
      include: this.detailsInclude,
    });
  }

  async findAll(templateId: string) {
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
      include: {
        createdBy: this.userSelect,
      },
    });
  }

  async findById(id: string) {
    const version = await this.prisma.templateVersion.findUnique({
      where: { id },
      include: {
        ...this.detailsInclude,
        template: true,
      },
    });

    if (!version) {
      throw new NotFoundException(`Template version with ID ${id} not found`);
    }

    return version;
  }

  async publish(templateId: string, versionId: string) {
    const version = await this.findById(versionId);

    if (version.templateId !== templateId) {
      throw new BadRequestException('Version does not belong to the specified template');
    }

    if (version.status === TemplateVersionStatus.ARCHIVED) {
      throw new BadRequestException('Cannot publish an archived version');
    }

    if (version.status === TemplateVersionStatus.PUBLISHED) {
      return version; // Already published
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Set all other PUBLISHED versions of this template to ARCHIVED (or just leave them? 
      // The prompt says "ensure previously published versions... are no longer left in an inconsistent published state")
      // Usually, we move them to ARCHIVED or just keep them as they are but they are no longer the "publishedVersion" on the Template.
      // However, the prompt implies changing their status.
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
    const version = await this.findById(versionId);

    if (version.templateId !== templateId) {
      throw new BadRequestException('Version does not belong to the specified template');
    }

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
