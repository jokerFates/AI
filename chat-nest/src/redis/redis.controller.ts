import { Controller, Post } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '@/core/response/response';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post()
  @ApiBearerAuth()
  async tset() {
    await this.redisService.test();
    return ApiResponse.success('测试成功');
  }
}
