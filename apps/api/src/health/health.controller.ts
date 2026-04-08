import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbStatus = await this.prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'up',
      },
    };
  }
}
