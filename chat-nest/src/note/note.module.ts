import { Module } from '@nestjs/common';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';
import { BookModule } from '@/book/book.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Note } from './entities/note.entity';
import { FileSchema } from '@/book/book.schema';
import { NoteLocation } from '@/note-locations/entities/note-location.entity';

@Module({
  imports: [
    BookModule,
    TypeOrmModule.forFeature([Note,NoteLocation]),
    MongooseModule.forFeature([{ name: 'file', schema: FileSchema }]),
  ],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
