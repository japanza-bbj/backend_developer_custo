import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotesDto } from './dto/query-notes.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNoteDto) {
    const note = await this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content,
        isPinned: dto.is_pinned ?? false,
        userId,
      },
    });

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      is_pinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    };
  }

  async findAll(userId: string, query: QueryNotesDto) {
    const { page = 1, limit = 20, is_pinned, search, sort = '-created_at' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NoteWhereInput = {
      userId,
      ...(is_pinned !== undefined && { isPinned: is_pinned }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    let orderBy: Prisma.NoteOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;

      if (field === 'created_at') {
        orderBy = { createdAt: isDesc ? 'desc' : 'asc' };
      } else if (field === 'title') {
        orderBy = { title: isDesc ? 'desc' : 'asc' };
      }
    }

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.note.count({ where }),
    ]);

    const data = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      is_pinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId, // กรองด้วย userId เพื่อป้องกันไม่ให้ดึงข้อมูลของคนอื่น
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return {
      id: note.id,
      title: note.title,
      content: note.content,
      is_pinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    };
  }
}