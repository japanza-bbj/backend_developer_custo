import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, Patch, HttpCode,  HttpStatus, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotesService } from './notes.service';
import { QueryNotesDto } from './dto/query-notes.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateNoteDto) {
    return this.notesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryNotesDto) {
    return this.notesService.findAll(req.user.id, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.notesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id:string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(req.user.id, id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id:string) {
    await this.notesService.remove(req.user.id,  id);
  }
}