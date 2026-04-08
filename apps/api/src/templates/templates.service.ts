import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { Prisma } from '@prisma/client';

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

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTemplateDto, actorId: string) {
    try {
      return await this.prisma.template.create({
        data: {
          ...dto,
          createdById: actorId,
        },
        include: this.detailsInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Template with code ${dto.code} already exists`);
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
      },
    });
  }

  async findById(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
      include: this.detailsInclude,
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    try {
      return await this.prisma.template.update({
        where: { id },
        data: dto,
        include: this.detailsInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }
      throw error;
    }
  }
}
