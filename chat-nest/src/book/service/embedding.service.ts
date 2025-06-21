import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 5000, // 增加超时时间
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-v3',
          input: text,
          dimensions: 768,
        });
        return response.data[0].embedding;
      } catch (error) {
        if (error.status === 429) {
          // 限流错误
          const waitTime = Math.pow(2, retries) * 1000;
          this.logger.warn(
            `触发限流，第${retries + 1}次重试，等待${waitTime}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          retries++;
        } else {
          this.logger.error(`Embedding生成失败: ${error.message}`);
          return new Array(768).fill(0);
        }
      }
    }
    this.logger.error(`超过最大重试次数(${MAX_RETRIES})`);
    return new Array(768).fill(0);
  }

}
