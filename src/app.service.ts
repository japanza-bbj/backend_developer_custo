import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    const userCount = await this.prisma.user.count();
    return {
      message: 'NestJS + Prisma + Postgres Connected Successfully!',
      totalUser: userCount,
    };
  }
}
