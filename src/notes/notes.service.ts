import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryNotesDto } from './dto/query-notes.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
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
        userId,
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

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.is_pinned !== undefined && { isPinned: dto.is_pinned }),
      },
    });

    return {
      id: updatedNote.id,
      title: updatedNote.title,
      content: updatedNote.content,
      is_pinned: updatedNote.isPinned,
      created_at: updatedNote.createdAt,
      updated_at: updatedNote.updatedAt,
    };
  }

  async remove(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    console.log("delete note",note)

    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return  note
    // await this.prisma.note.delete(note);
}
}