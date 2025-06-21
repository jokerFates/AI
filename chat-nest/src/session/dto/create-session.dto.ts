import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: '标题' })
  @IsNotEmpty({ message: '标题必填' })
  title: string;

  @ApiProperty({ description: '聊天记录' })
  @IsNotEmpty({ message: '聊天记录必填' })
  chat: string;

  @ApiProperty({ description: '用户名' })
  @IsNotEmpty({ message: '用户名必填' })
  user: string;

}
