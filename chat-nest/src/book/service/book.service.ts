import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as iconv from 'iconv-lite';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { RedisService } from '@/redis/redis.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { ApiResponse } from '@/core/response/response';
import { MergeDto } from '../dto/merge.dto';

// 添加MongoDB相关引入
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileEntity } from '../book.schema';
import { FileStrategy } from './mongo-strategy.service';
import { detect } from 'chardet';
import { extractRawText } from 'mammoth'; // DOCX解析
import pdf from 'pdf-parse'; // PDF解析
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MilvusService } from '@/milvus/milvus.service';
import { EmbeddingService } from './embedding.service';
import { Note } from '@/note/entities/note.entity';
import { NoteLocation } from '@/note-locations/entities/note-location.entity';

// 返回类型明确区分
type FileMeta = {
  filename: string;
  fileType: string;
  fileExtension: string;
  size: number;
};
type FileResult = { html: string; meta: FileMeta };

// 在Service中注入MongoDB模型
@Injectable()
export class BookService {
  // 修改注入的依赖
  constructor(
    @InjectModel('file') private fileModel: Model<FileEntity>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    private redisService: RedisService, // 改为注入RedisService
    @Inject('FILE_STRATEGY')
    private fileStrategy: FileStrategy,
    private milvusService: MilvusService,
    @InjectQueue('vector') private vectorQueue: Queue,
    private embeddingService: EmbeddingService,
    @InjectRepository(Note) // 新增笔记仓库注入
    private noteRepository: Repository<Note>,
    @InjectRepository(NoteLocation) // 新增笔记位置仓库注入
    private noteLocationRepository: Repository<NoteLocation>,
  ) {}

  async getBookOrFail(bookId: number) {
    const book = await this.bookRepository.findOneBy({ id: bookId });
    if (!book) throw new NotFoundException('书籍不存在');
    return book;
  }

  // 在类内部添加以下方法
  convertHtmlToText(html: string): string {
    // 保留换行结构
    const blockTags = [
      'p',
      'div',
      'br',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ];
    const text = html
      // 处理块级标签换行
      .replace(new RegExp(`</?(${blockTags.join('|')})[^>]*>`, 'gi'), '\n')
      // 移除其他标签
      .replace(/<[^>]+>/g, '')
      // 合并连续换行
      .replace(/\n+/g, '\n')
      // 处理HTML实体
      .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, ' ')
      // 修剪空白字符
      .trim();

    return text;
  }

  extractFileId(path: string) {
    const match = path.match(/^mongodb:(.+)/);
    if (!match) throw new BadRequestException('无效的文件路径格式');
    return match[1];
  }

  // 解决不同编码格式的文本文件解析问题
  private parseText(content: Buffer) {
    const detectedEncoding = detect(content) || 'utf-8';
    const text = iconv.decode(content, detectedEncoding);
    return text;
  }

  // 提取纯文本内容的方法
  private async extractTextContent(
    buffer: Buffer,
    fileType: string,
  ): Promise<string> {
    try {
      if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const { value } = await extractRawText({ buffer });
        return value;
      }

      if (fileType === 'application/pdf') {
        const data = await pdf(buffer);
        return data.text;
      }

      // 保留原有文本解析逻辑
      return this.parseText(buffer);
    } catch (e) {
      console.error('文件解析失败:', e);
      return ''; // 返回空字符串避免流程中断
    }
  }

  // 新增HTML解析方法
  private async parseToHtml(
    buffer: Buffer,
    fileType: string,
  ): Promise<string | undefined> {
    try {
      const processContent = (content: string) => {
        // 合并连续换行（保留单个<br>）
        const normalized = content
          .replace(/(<br\s*\/?>){2,}/gi, '<br/>') // 合并多个换行为单个
          .replace(/^(<br\s*\/?>)+/, '') // 移除开头的换行
          .replace(/(<br\s*\/?>)+$/, ''); // 移除结尾的换行

        return normalized
          .split(/<br\s*\/?>/g)
          .map((p) => {
            const cleanPara = p.trim();
            if (!cleanPara) return '';

            const hash = crypto
              .createHash('md5')
              .update(cleanPara)
              .digest('hex');

            // 段落间保留一个换行
            return `<div class="content-para" data-pid="${hash}">${cleanPara}</div><br/>`;
          })
          .join('')
          .replace(/<br\/>$/, ''); // 移除最后一个多余的换行
      };

      if (fileType === 'application/pdf') {
        const data = await pdf(buffer);
        return `<div class="pdf-content">${processContent(
          data.text.replace(/\n/g, '<br/>'),
        )}</div>`;
      }

      if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const { value } = await extractRawText({ buffer });
        return `<div class="docx-content">${processContent(
          value.replace(/\n/g, '<br/>'),
        )}</div>`;
      }

      if (fileType === 'text/plain') {
        const text = this.parseText(buffer);
        return `<div class="txt-content">${processContent(
          text.replace(/\n/g, '<br/>'),
        )}</div>`;
      }
    } catch (e) {
      console.error('HTML解析失败:', e);
      return undefined;
    }
  }

  async getBookList(user: string, title?: string) {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.userAccount = :user', { user });

    if (title?.trim()) {
      queryBuilder.andWhere('book.name LIKE :title', { title: `%${title}%` });
    }

    return queryBuilder.orderBy('book.update_time', 'DESC').getMany();
  }

  async checkFileExisted(md5: string, username: string) {
    const existFile = await this.bookRepository.find({
      where: { fileMd5: md5, userAccount: username },
    });
    if (existFile.length) {
      return ApiResponse.success('文件已存在', true);
    } else return ApiResponse.success('', false);
  }

  async checkFile(md5: string) {
    const existFile = await this.redisService.getAllChunks(md5);
    return ApiResponse.success('', existFile);
  }

  async deleteBook(id: number) {
    const book = await this.bookRepository.findOneBy({ id });
    const mongoFileId = book.path.replace('mongodb:', '');

    // 扩展删除逻辑
    return this.bookRepository.manager.transaction(async (manager) => {
      // 1. 删除关联笔记位置
      await manager.delete(NoteLocation, {
        noteId: In(
          await manager
            .find(Note, { where: { bookId: id } })
            .then((notes) => notes.map((n) => n.id)),
        ),
      });

      // 2. 删除关联笔记
      await manager.delete(Note, { bookId: id });

      // 3. 删除书籍和文件（原有逻辑）
      await Promise.all([
        manager.delete(Book, { id }),
        this.fileModel.deleteOne({ _id: mongoFileId }).exec(),
      ]);

      // 4. 删除向量数据（原有逻辑）
      try {
        await this.milvusService.deleteVectorsByBookId(id);
      } catch (e) {
        console.error(`向量数据删除失败: ${e.message}`);
      }
    });
  }

  async handleUpload(
    file: Express.Multer.File,
    body: Omit<CreateBookDto, 'file'>,
  ) {
    const { chunkNumber, totalChunks, md5 } = body;

    // 使用RedisService保存分片
    await this.redisService.saveChunk(
      md5,
      chunkNumber,
      file.buffer.toString('binary'),
    );

    return ApiResponse.success('', { chunkNumber, totalChunks });
  }

  async mergeFile(body: MergeDto) {
    const { md5, totalChunks, fileName, fileType, user, fileExtension } = body;
    // 获取分片总数
    const storedChunks = await this.redisService.getAllChunks(md5);
    const chunkCount = Object.keys(storedChunks).length;

    if (chunkCount !== totalChunks) {
      return ApiResponse.fail('分片不完整');
    }

    // 双重检查文件存在性
    const finalCheck = await this.bookRepository.findOneBy({ fileMd5: md5 });
    if (finalCheck) {
      return ApiResponse.success('文件已上传', finalCheck);
    }

    // 合并分片
    const sortedChunks = Object.entries(storedChunks)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([_, value]: any) => Buffer.from(value, 'binary'));

    const fileBuffer = Buffer.concat(sortedChunks);

    await this.redisService.deleteChunks(md5);

    // 保存完整文件
    const newFile = new this.fileModel({
      filename: fileName,
      md5: md5,
      content: fileBuffer,
      uploadDate: new Date(),
      length: fileBuffer.length,
      html: await this.parseToHtml(fileBuffer, fileType),
    });
    await newFile.save();

    // 修改数据库记录中的路径为MongoDB文件引用
    const newBook = this.bookRepository.create({
      name: fileName,
      fileType: fileType,
      userAccount: user,
      fileMd5: md5,
      size: fileBuffer.length,
      path: `mongodb:${newFile._id}`,
      fileExtension,
    });

    await this.bookRepository.save(newBook);

    
    try {
      const textContent = await this.extractTextContent(fileBuffer, fileType);

      
      await this.vectorQueue.add('process-vector', {
        textContent,
        bookId: newBook.id,
        fileName,
      });
    } catch (e) {
      console.error('任务入队失败:', e);
    }
    return ApiResponse.success('上传成功', newBook);
  }

  // 获取文件内容
  async getFileContentByBookId(bookId: number): Promise<FileResult> {
    // 1. 获取书籍元数据
    const book = await this.getBookOrFail(bookId);

    // 2. 提取文件标识符
    const fileId = this.extractFileId(book.path);

    // 3. 获取文件原始内容
    const { content, filename, html } = await this.fileStrategy.getFileContent(
      fileId,
      book,
    );

    const meta: FileMeta = {
      filename,
      fileType: book.fileType,
      fileExtension: book.fileExtension,
      size: content.length,
    };

    return {
      html,
      meta,
    };
  }

  async getVectorProgress(bookId: number) {
    const data = await this.redisService.getAll(`vector:${bookId}`);
    return {
      status: data?.status || 'pending',
      progress: data?.progress ? parseInt(data.progress) : 0,
      error: data?.error,
    };
  }

  // 更新书籍标题
  async updateTitle(id: number, newTitle: string) {
    const book = await this.getBookOrFail(id);
    const fileId = this.extractFileId(book.path); // 从路径提取MongoDB文件ID

    // 同时更新MySQL和MongoDB
    const [updatedBook] = await Promise.all([
      this.bookRepository.save({ ...book, name: newTitle }),
      this.fileModel
        .findByIdAndUpdate(fileId, { filename: newTitle }, { new: true })
        .exec(),
    ]);
    return updatedBook;
  }

  // 生成摘要
  async generateSummary(bookId: number, query: string) {
    const book = await this.getBookOrFail(bookId);

    // 1. 增强检索逻辑
    const queryVector = await this.embeddingService.generateEmbedding(query);
    const relatedChunks = await this.milvusService.searchVectors(
      queryVector,
      10,
    ); // 增加检索数量

    // 对检索结果进行排序和去重
    const uniqueChunks = Array.from(
      new Map(relatedChunks.map((item) => [item.book_id, item])).values(),
    );

    // 2. 获取检索到的文本段落
    const retrievedContent = await Promise.all(
      uniqueChunks.map(async (chunk: { book_id: number }) => {
        const book = await this.bookRepository.findOneBy({ id: chunk.book_id });
        if (!book) return '';

        const { html } = await this.fileStrategy.getFileContent(
          this.extractFileId(book.path),
          book,
        );

        return this.convertHtmlToText(html).slice(0, 500); // 取前500字符
      }),
    );

    // 3. 构建增强型提示
    const maxContextLength = 25000;
    const ragPrompt = `
    基于以下检索到的相关段落和原始文档，生成结构化摘要：
    
    【用户查询】
    ${query}
    
    【检索到的关键信息】
    ${retrievedContent.join('\n\n').slice(0, 10000)}
    
    【当前文档概览】
    ${this.convertHtmlToText(
      (
        await this.fileStrategy.getFileContent(
          this.extractFileId(book.path),
          book,
        )
      ).html,
    ).replace(/<[^>]+>/g, '')}
    
    请按以下要求生成：
    1. 识别3-5个核心主题(每个主题不超过10字)
    2. 提取与查询最相关的3个论点(每个论点不超过50字)
    3. 总结关键数据/案例(不超过100字)
    4. 最后用一段话综合说明文档价值(不超过150字)
    `;

    // 4. 添加长度校验
    if (ragPrompt.length > maxContextLength) {
      throw new BadRequestException('上下文过长，请优化查询条件');
    }

    return ragPrompt;
  }

  // 文章改写
  async rewriteArticle(bookId: number, query: string) {
    const book = await this.getBookOrFail(bookId);
    const { html } = await this.fileStrategy.getFileContent(
      this.extractFileId(book.path),
      book,
    );
    const maxContextLength = 25000;

    const ragPrompt = `
    基于以下检索到的原始文档，改写文章：
    
    【用户改写要求】
    ${query}
    
    【当前文档概览】
    ${this.convertHtmlToText(html).replace(/<[^>]+>/g, '')}
    `;

    if (ragPrompt.length > maxContextLength) {
      throw new BadRequestException('上下文过长，请优化查询条件');
    }

    return ragPrompt;
  }

  private async getMultiDocumentContext(chunks: Array<{ text: string }>) {
    const uniqueBookIds = [...new Set(chunks.map((c) => c.text))];

    return Promise.all(
      uniqueBookIds.map(async (text) => {
        return `[有关片段内容${text}]\n`;
      }),
    ).then((contents) => contents.join('\n\n'));
  }

  // 向量化任务处理
  async processVectorTask(querys: string[]) {
    const newQ = [...querys];
    const curQuery = newQ.pop() || ''; // 取最后一个问题作为当前问题
    const historyQuerys = newQ;
    //生成查询向量（保持为二维数组）
    const queryVectors =
      await this.embeddingService.generateEmbedding(curQuery);

    //检索相似内容
    const relatedChunks =
      await this.milvusService.searchChunkVectors(queryVectors);

    //获取相关文本
    const context = await this.getMultiDocumentContext(relatedChunks);

    return `根据以下知识库内容回答问题：
    【相关文档片段】  
    ${context}

    【历史问题】
    ${historyQuerys.join('\n\n')}

    【当前问题】
    ${curQuery}

    请按以下要求回答：
    1. 优先使用文档中的具体数据/案例
    2. 保持回答简洁专业
    3. 如没有相关文档则不用管知识库，自己想回答什么回答什么
    4. 不要加上额外解释，直接回答有关内容
    `;
  }
}
