import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileEntity } from '../book.schema';
import { Book } from '../entities/book.entity';

export interface FileStrategy {
  getFileContent(
    fileId: string,
    book: Book,
  ): Promise<{
    content: Buffer;
    filename: string;
    fileType: string;
    html?: string;
  }>;
}

@Injectable()
export class MongoFileStrategy implements FileStrategy {
  constructor(@InjectModel('file') private fileModel: Model<FileEntity>) {}

  async getFileContent(fileId: string, book: Book) {
    const file = await this.fileModel.findById(fileId).exec();
    if (!file) throw new NotFoundException('文件不存在');

    return {
      content: file.content,
      filename: file.filename,
      html: file.html,
      fileType: book.fileType,
    };
  }
}
