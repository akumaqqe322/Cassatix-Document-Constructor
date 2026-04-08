import { Controller, Get, Post, Body, Patch, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';

@Controller('templates')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  create(@Body() dto: CreateTemplateDto) {
    // Simulated actorId until auth is implemented
    const actorId = '00000000-0000-0000-0000-000000000000'; 
    return this.templatesService.create(dto, actorId);
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
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templatesService.update(id, dto);
  }
}
