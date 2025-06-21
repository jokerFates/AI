import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {

  @ApiProperty({ description: '提示词' })
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @ApiProperty({ description: '模型' })
  @IsNotEmpty()
  @IsString()
  modal: string;

  @ApiProperty({ description: '会话记录' })
  @IsArray()
  sessions: Array<any>;
}
