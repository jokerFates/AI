import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: '书籍ID' })
  @IsNotEmpty()
  @IsNumber()
  bookId: number;

  @ApiProperty({ description: '选中的原始文本' })
  @IsNotEmpty()
  @IsString()
  selectedText: string;

  @ApiProperty({ description: '所在段落的data-pid值' })
  @IsNotEmpty()
  @IsString()
  dataPid: string;

  @ApiProperty({ description: '笔记内容' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '高亮颜色', default: '#ffeb3b' })
  @IsString()
  highlightColor: string;
}
