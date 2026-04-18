import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

@Injectable()
export class TemplatesService {
  private readonly userSelect = {
    select: {
      id: true,
      name: true,
      email: true,
    },
  } as const;

  private readonly detailsInclude = {
    publishedVersion: true,
    createdBy: this.userSelect,
  } as const;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateTemplateDto, actorId: string) {
    // Minimal valid temporary actor strategy:
    // If the provided actorId is the dummy one, try to find the first admin user.
    let effectiveActorId = actorId;
    
    if (actorId === '00000000-0000-0000-0000-000000000000') {
      const admin = await this.prisma.user.findFirst({
        where: { role: { code: 'admin' } }
      });
      
      if (!admin) {
        throw new DomainException(
          'No admin user found in the system to act as owner. Please check environment seeding.',
          ErrorCode.FORBIDDEN_ACTION,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      effectiveActorId = admin.id;
    }

    try {
      const template = await this.prisma.template.create({
        data: {
          ...dto,
          createdById: effectiveActorId,
        },
        include: this.detailsInclude,
      });

      await this.auditService.record({
        entityType: 'TEMPLATE',
        entityId: template.id,
        action: 'TEMPLATE_CREATED',
        actorId: effectiveActorId,
        metadata: { name: template.name, code: template.code },
      });

      return template;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new DomainException(
          `Template with code ${dto.code} already exists`,
          ErrorCode.FORBIDDEN_ACTION,
          HttpStatus.CONFLICT
        );
      }
      throw error;
    }
  }

  async findAll(query: TemplateQueryDto) {
    const { status, category, caseType } = query;
    return this.prisma.template.findMany({
      where: {
        status,
        category,
        caseType,
      },
      // Lighter list query: only include basic info and published version status
      include: {
        publishedVersion: {
          select: {
            id: true,
            status: true,
            versionNumber: true,
          },
        },
        versions: {
          select: {
            id: true,
            status: true,
            versionNumber: true,
            validationStatus: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: this.detailsInclude,
    });

    if (!template) {
      throw new DomainException(
        `Template with ID ${id} not found`,
        ErrorCode.TEMPLATE_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto, actorId: string) {
    // Minimal valid temporary actor strategy
    let effectiveActorId = actorId;
    if (actorId === '00000000-0000-0000-0000-000000000000') {
      const admin = await this.prisma.user.findFirst({
        where: { role: { code: 'admin' } }
      });
      if (admin) effectiveActorId = admin.id;
    }

    try {
      const template = await this.prisma.template.update({
        where: { id },
        data: dto,
        include: this.detailsInclude,
      });

      await this.auditService.record({
        entityType: 'TEMPLATE',
        entityId: template.id,
        action: 'TEMPLATE_UPDATED',
        actorId: effectiveActorId,
        metadata: {
          changes: Object.keys(dto),
          status: dto.status,
          category: dto.category,
          caseType: dto.caseType,
        },
      });

      return template;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new DomainException(
          `Template with ID ${id} not found`,
          ErrorCode.TEMPLATE_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      throw error;
    }
  }

  async delete(id: string, actorId: string) {
    const template = await this.findById(id);

    // Using a transaction to ensure all related data is cleaned up properly
    // even if foreign key constraints are set to RESTRICT in the database.
    await this.prisma.$transaction(async (tx) => {
      // 1. Clear circular reference from Template to TemplateVersion (publishedVersion)
      await tx.template.update({
        where: { id },
        data: { publishedVersionId: null },
      });

      // 1.5. Prevent deletion if there are active generation jobs to avoid orphaning
      const activeDocuments = await tx.generatedDocument.count({
        where: {
          templateId: id,
          status: { in: ['QUEUED', 'PROCESSING'] },
        },
      });

      if (activeDocuments > 0) {
        throw new DomainException(
          `Cannot delete template while ${activeDocuments} document(s) are actively being generated. Please wait for them to finish.`,
          ErrorCode.FORBIDDEN_ACTION,
          HttpStatus.CONFLICT
        );
      }

      // 2. Delete generated documents first (leaves)
      await tx.generatedDocument.deleteMany({
        where: { templateId: id },
      });

      // 3. Delete template versions (inner nodes)
      await tx.templateVersion.deleteMany({
        where: { templateId: id },
      });

      // 4. Finally delete the template (root)
      await tx.template.delete({
        where: { id },
      });
    });

    await this.auditService.record({
      entityType: 'TEMPLATE',
      entityId: id,
      action: 'TEMPLATE_DELETED',
      actorId,
      metadata: { name: template.name, code: template.code },
    });

    return { success: true };
  }
}
