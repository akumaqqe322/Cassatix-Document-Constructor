import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    const existing = await this.prisma.template.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Template with code ${dto.code} already exists`);
    }

    return this.prisma.template.create({
      data: dto,
    });
  }

  async findAll(query: TemplateQueryDto) {
    const { status, category, caseType } = query;
    return this.prisma.template.findMany({
      where: {
        status,
        category,
        caseType,
      },
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

  async findById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
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

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findById(id);

    return this.prisma.template.update({
      where: { id },
      data: dto,
    });
  }
}
