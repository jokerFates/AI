import { Module } from '@nestjs/common';
import { NoteLocationsService } from './note-locations.service';
import { NoteLocationsController } from './note-locations.controller';

@Module({
  controllers: [NoteLocationsController],
  providers: [NoteLocationsService],
})
export class NoteLocationsModule {}
