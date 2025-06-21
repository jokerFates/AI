import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from './entities/note.entity';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { FileEntity } from '@/book/book.schema';
import { BookService } from '@/book/service/book.service';
import { NoteLocation } from '@/note-locations/entities/note-location.entity';
import { PreviewNoteDto } from './dto/preview-note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(NoteLocation)
    private noteLocationRepository: Repository<NoteLocation>,
    @InjectModel('file')
    private fileModel: Model<FileEntity>,
    private bookService: BookService,
  ) {}

  private async updateBookHtml(bookId: number, newHtml: string) {
    const book = await this.bookService.getBookOrFail(bookId);
    const fileId = this.bookService.extractFileId(book.path);

    return this.fileModel
      .findByIdAndUpdate(fileId, { $set: { html: newHtml } }, { new: true })
      .exec();
  }

  private applyHighlight(
    html: string,
    params: {
      dataPid: string;
      selectedText: string;
      highlightId: string;
    },
  ) {
    const escapedText = params.selectedText.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    // 修改正则表达式，允许已存在高亮标签的情况
    const regex = new RegExp(
      `(<div class="content-para" data-pid="${params.dataPid}">)(.*?)(</div>)`,
      'gis',
    );

    return html.replace(regex, (_, openTag, content, closeTag) => {
      // 在段落内容中定位原始文本（即使已经被部分高亮）
      const contentWithHighlight = content.replace(
        new RegExp(`(?<!")(${escapedText})(?!"])`, 'gi'),
        `<span id="${params.highlightId}" 
             style="background-color:#ffeb3b;cursor:pointer;"
             class="highlight" 
             data-annotation="${encodeURIComponent(params.selectedText)}">$1</span>`,
      );

      return `${openTag}${contentWithHighlight}${closeTag}`;
    });
  }
  async create(createNoteDto: CreateNoteDto) {
    const highlightId = `highlight-${crypto.randomUUID()}`;
    const { html } = await this.bookService.getFileContentByBookId(
      createNoteDto.bookId,
    );

    // 生成高亮HTML
    const newHtml = this.applyHighlight(html, {
      dataPid: createNoteDto.dataPid,
      selectedText: createNoteDto.selectedText,
      highlightId,
    });

    // 更新MongoDB中的HTML
    await this.updateBookHtml(createNoteDto.bookId, newHtml);

    // 保存笔记记录（使用事务）
    return this.noteRepository.manager.transaction(async (manager) => {
      const note = await manager.save(Note, {
        userId: createNoteDto.userId,
        bookId: createNoteDto.bookId,
        content: createNoteDto.content,
      });

      await manager.save(NoteLocation, {
        noteId: note.id,
        highlightId,
        selectedText: createNoteDto.selectedText,
        dataPid: createNoteDto.dataPid,
        highlightColor: createNoteDto.highlightColor,
      });

      return note;
    });
  }

  async getNote(dto: PreviewNoteDto) {
    const note = await this.noteLocationRepository.findOne({
      where: { highlightId: dto.highlightId, dataPid: dto.dataPid },
    });

    if (!note) {
      throw new NotFoundException('未找到相关笔记');
    }

    const noteContent = await this.noteRepository.findOne({
      where: { id: note.noteId },
      select: ['content'], // 只选择content字段
    });

    return noteContent.content;
  }

  async deleteNote(dto: PreviewNoteDto) {
    // 获取高亮定位信息
    const noteLocation = await this.noteLocationRepository.findOne({
      where: {
        highlightId: dto.highlightId,
        dataPid: dto.dataPid,
      },
    });

    return this.noteRepository.manager.transaction(async (manager) => {
      // 删除笔记主记录
      await manager.delete(Note, {
        id: noteLocation.noteId,
      });

      // 删除定位记录
      await manager.delete(NoteLocation, {
        noteId: noteLocation.noteId,
      });

      // 从MongoDB HTML中移除高亮
      const { html } = await this.bookService.getFileContentByBookId(
        dto.bookId,
      );
      const newHtml = this.removeHighlight(html, dto.highlightId);

      await this.updateBookHtml(dto.bookId, newHtml);
    });
  }

  private removeHighlight(html: string, highlightId: string) {
    // 匹配指定ID的高亮标签
    const regex = new RegExp(
      `<span id="${highlightId}"[^>]*>(.*?)</span>`,
      'gis',
    );

    return html.replace(regex, '$1'); // 用原始文本替换高亮标签
  }
}
