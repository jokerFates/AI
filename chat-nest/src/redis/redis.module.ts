// redis.module.ts
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisController } from './redis.controller';

@Global() // 关键装饰器
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  controllers: [RedisController],
  exports: [RedisService], // 导出服务
})
export class RedisCacheModule {}
