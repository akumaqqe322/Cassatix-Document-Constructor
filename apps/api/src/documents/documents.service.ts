import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.generatedDocument.findMany({
      include: {
        template: true,
        templateVersion: true,
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: true,
        templateVersion: true,
        requestedBy: true,
      },
    });
  }

  async findByCaseId(caseId: string) {
    return this.prisma.generatedDocument.findMany({
      where: { caseId },
      include: {
        template: true,
        templateVersion: true,
      },
    });
  }
}
