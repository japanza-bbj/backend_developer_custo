import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  getProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      avatar_url: '/api/v1/users/me/avatar',
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.full_name && { fullName: dto.full_name }),
      },
    });

    return this.getProfile(updatedUser);
  }

  async uploadAvatar(userId: string, file: any) { 
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งาน');

    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const relativePath = `uploads/avatars/${file.originalname}`;

    if (user.avatarPath) {
      const oldFilePath = path.join(process.cwd(), user.avatarPath);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error('Failed to delete old avatar:', err);
        }
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath: relativePath },
    });

    return {
      avatar_url: relativePath,
    };
  }

  async removeAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบข้อมูลผู้ใช้งาน');

    if (user.avatarPath) {
      const filePath = path.join(process.cwd(), user.avatarPath);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Failed to delete avatar file:', err);
        }
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarPath: null },
    });

    return { message: 'Avatar deleted successfully' };

    }
  }