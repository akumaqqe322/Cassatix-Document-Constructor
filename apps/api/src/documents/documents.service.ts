import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.generatedDocument.findMany();
  }

  async findById(id: string) {
    return this.prisma.generatedDocument.findUnique({
      where: { id },
    });
  }
}
