import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookTitleDto {
  @ApiProperty({ description: '新标题' })
  @IsNotEmpty()
  @IsString()
  title: string;
}
