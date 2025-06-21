import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: '姓名', default: 'admin' })
  @IsNotEmpty({ message: '姓名必填' })
  username: string;

  @ApiProperty({ description: '密码', default: '123' })
  @IsNotEmpty({ message: '密码必填' })
  password: string;
}
