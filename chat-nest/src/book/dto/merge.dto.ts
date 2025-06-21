import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class MergeDto {
  @ApiProperty({ description: '文件哈希', type: String })
  @IsString()
  md5: string;

  @ApiProperty({ description: '切片总数', type: Number })
  @Type(() => Number) 
  @IsNumber()
  totalChunks: number;

  @ApiProperty({ description: '用户名', type: String })
  @IsString()
  user: string;

  @ApiProperty({ description: '文件名称', type: String })
  @IsString()
  fileName: string;

  @ApiProperty({ description: '文件类型', type: String })
  @IsString()
  fileType: string;

  @ApiProperty({ description: '文件后缀', type: String })
  @IsString()
  fileExtension: string;
}
