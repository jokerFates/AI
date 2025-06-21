import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: '文件哈希', type: String })
  @IsString()
  md5: string;

  @ApiProperty({ description: '切片序列', type: Number })
  @Type(() => Number) 
  @IsNumber()
  chunkNumber: number;

  @ApiProperty({ description: '切片总数', type: Number })
  @Type(() => Number) 
  @IsNumber()
  totalChunks: number;

  @ApiProperty({ description: '用户名', type: String })
  @IsString()
  user: string;

  @ApiProperty({ description: '上传文件', type: String, format: 'binary' })
  file: Express.Multer.File;
}
