import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll() {
    return this.prisma.generatedDocument.findMany({
      include: {
        template: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const doc = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: {
        template: true,
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return doc;
  }

  async getDownloadUrl(id: string) {
    const doc = await this.findById(id);

    if (!doc.storagePath) {
      throw new NotFoundException(`Document ${id} has no file associated with it`);
    }

    return this.storageService.getDownloadUrl(doc.storagePath);
  }
}
