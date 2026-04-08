import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // In this environment, we might not have a real DB connection during bootstrap
    // so we catch the error to allow the app to start
    try {
      await this.$connect();
    } catch (err) {
      console.warn('Prisma failed to connect to database:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
