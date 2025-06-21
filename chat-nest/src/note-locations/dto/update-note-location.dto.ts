import { PartialType } from '@nestjs/swagger';
import { CreateNoteLocationDto } from './create-note-location.dto';

export class UpdateNoteLocationDto extends PartialType(CreateNoteLocationDto) {}
