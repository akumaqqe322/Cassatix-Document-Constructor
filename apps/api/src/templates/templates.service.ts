import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.template.findMany({
      include: {
        publishedVersion: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.template.findUnique({
      where: { code },
      include: {
        publishedVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
      include: {
        publishedVersion: true,
      },
    });
  }
}
