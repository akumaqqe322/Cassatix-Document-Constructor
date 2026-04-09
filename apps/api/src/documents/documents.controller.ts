import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }
}
