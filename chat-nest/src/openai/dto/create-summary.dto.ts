import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';

export class CreateSummaryDto extends CreateChatDto {
  @ApiProperty({ description: '书籍id' })
  @IsNotEmpty()
  @IsString()
  bookId: string;
}
