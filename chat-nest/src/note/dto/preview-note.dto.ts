import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PreviewNoteDto {
  @ApiProperty({ description: '用户ID' })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: '书籍ID' })
  @IsNotEmpty()
  @IsNumber()
  bookId: number;

  @ApiProperty({ description: '高亮唯一标识' })
  @IsString()
  highlightId: string;

  @ApiProperty({ description: '所在段落的data-pid值' })
  @IsNotEmpty()
  @IsString()
  dataPid: string;
}
