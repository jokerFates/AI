import { Controller, Post, Body, Delete } from '@nestjs/common';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { ApiResponse } from '@/core/response/response';
import { ApiBody } from '@nestjs/swagger';
import { PreviewNoteDto } from './dto/preview-note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @ApiBody({ type: CreateNoteDto })
  async create(@Body() createNoteDto: CreateNoteDto) {
    const res = await this.noteService.create(createNoteDto);
    return ApiResponse.success('创建笔记成功', res);
  }

  @Post('preview')
  @ApiBody({ type: PreviewNoteDto })
  async preview(@Body() dto: PreviewNoteDto) {
    const res = await this.noteService.getNote(dto);
    return ApiResponse.success('', res);
  }

  @Post('delete')
  @ApiBody({ type: PreviewNoteDto })
  async delete(@Body() dto: PreviewNoteDto) {
    await this.noteService.deleteNote(dto);
    return ApiResponse.success('删除笔记成功');
  }
}
