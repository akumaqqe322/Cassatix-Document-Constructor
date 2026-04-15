import { Controller, Get, Post, Body, Patch, Param, Query, UsePipes, ValidationPipe, UseGuards, Delete } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@Controller('templates')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles('admin', 'lawyer')
  create(@Body() dto: CreateTemplateDto, @User() user: any) {
    return this.templatesService.create(dto, user.id);
  }

  @Get()
  findAll(@Query() query: TemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'lawyer')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @User() user: any) {
    return this.templatesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id') id: string, @User() user: any) {
    return this.templatesService.delete(id, user.id);
  }
}
