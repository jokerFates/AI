// redis.service.ts
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { log } from 'console';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis()
    private readonly redisClient: Redis,
  ) {
    // 使用redisClient执行Redis操作
  }

  async test(): Promise<void> {
    await this.redisClient.hset('test', 'id1', '666');
    await this.redisClient.hset('test', 'id2', '688');
    const value = await this.redisClient.hgetall('test');
    console.log('Redis Test Result:', value);
    log(Object.keys(value));
  }

  // 新增分片操作方法
  async saveChunk(
    md5: string,
    chunkNumber: number,
    buffer: string,
  ): Promise<void> {
    await this.redisClient.hset(`file:chunks:${md5}`, chunkNumber, buffer);
  }

  // 新增文件存在检查
  async checkFileExists(md5: string): Promise<string | null> {
    return await this.redisClient.get(`file:${md5}`);
  }

  // 新增获取所有分片
  async getAllChunks(md5: string): Promise<Record<string, string>> {
    return await this.redisClient.hgetall(`file:chunks:${md5}`);
  }

  // 新增保存完整文件
  async saveFile(md5: string, buffer: Buffer, ttl = 86400): Promise<void> {
    await this.redisClient.set(`file:${md5}`, buffer, 'EX', ttl);
  }

  // 新增删除分片数据
  async deleteChunks(md5: string): Promise<void> {
    await this.redisClient.del(`file:chunks:${md5}`);
  }

  // 添加以下三个方法到RedisService中
  async getLock(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async setLock(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.redisClient.set(key, value, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async deleteLock(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl || 86400);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async getAll(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  // 新增方法：设置失效令牌
  async setInvalidToken(token: string, ttl: number): Promise<void> {
    await this.redisClient.set(`invalid_token:${token}`, '1', 'EX', ttl);
  }

  // 新增方法：检查令牌是否失效
  async isTokenInvalid(token: string): Promise<boolean> {
    return (await this.redisClient.exists(`invalid_token:${token}`)) === 1;
  }
}
