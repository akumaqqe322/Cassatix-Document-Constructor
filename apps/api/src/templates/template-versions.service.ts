import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateVersionsService {
  constructor(private prisma: PrismaService) {}

  async findByTemplateId(templateId: string) {
    return this.prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.templateVersion.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });
  }

  async findLatestVersion(templateId: string) {
    return this.prisma.templateVersion.findFirst({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
    });
  }
}
