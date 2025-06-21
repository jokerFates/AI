import { forwardRef, Module } from '@nestjs/common';
import { BookService } from './service/book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './book.schema';
import { MongoFileStrategy } from './service/mongo-strategy.service';
import { FileTypeService } from './service/file-type.service';
import { MilvusModule } from '@/milvus/milvus.module'; // 新增导入
import { OpenAIModule } from '@/openai/openai.module';
import { EmbeddingService } from './service/embedding.service';
import { BullModule } from '@nestjs/bull';
import { VectorProcessor } from './worker/vector.processor';
import { NoteLocation } from '@/note-locations/entities/note-location.entity';
import { Note } from '@/note/entities/note.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'file', schema: FileSchema }]),
    TypeOrmModule.forFeature([Book, NoteLocation, Note]),
    MilvusModule,
    forwardRef(() => OpenAIModule),
    BullModule.registerQueue({
      name: 'vector',
    }),
  ],
  controllers: [BookController],
  providers: [
    BookService,
    {
      provide: 'FILE_STRATEGY',
      useClass: MongoFileStrategy, // 可替换为其他存储策略
    },
    FileTypeService,
    EmbeddingService,
    VectorProcessor,
  ],
  exports: [
    BookService,
    MongooseModule.forFeature([{ name: 'file', schema: FileSchema }]),
    TypeOrmModule.forFeature([Book]),
  ],
})
export class BookModule {}
