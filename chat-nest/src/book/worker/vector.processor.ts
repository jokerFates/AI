import { MilvusService } from '@/milvus/milvus.service';
import { Process, Processor } from '@nestjs/bull';
import { EmbeddingService } from '../service/embedding.service';
import {
  RecursiveCharacterTextSplitter,
  TextSplitter,
} from 'langchain/text_splitter';
import { Job } from 'bull';
import { RedisService } from '@/redis/redis.service';
import { log } from 'console';

@Processor('vector')
export class VectorProcessor {
  constructor(
    private milvusService: MilvusService,
    private embeddingService: EmbeddingService,
    private redisService: RedisService,
  ) {}

  public static readonly MAX_TEXT_LENGTH = 512;

  private async updateProgress(
    key: string,
    status: string,
    progress: number,
    error?: string,
  ) {
    await this.redisService.set(
      key,
      JSON.stringify({
        status,
        progress: progress.toString(),
        ...(error ? { error } : {}),
      }),
    );
  }

  @Process('process-vector')
  async handleVectorJob(job: Job<{ textContent: string; bookId: number }>) {
    const { textContent, bookId } = job.data;
    const redisKey = `vector:${bookId}`;

    try {
      // 初始化进度
      await this.updateProgress(redisKey, 'processing', 0);

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
      });

      // 生成文本分块
      const chunks = await textSplitter.createDocuments([textContent]);

      // 生成向量并准备插入数据
      const vectorsWithMetadata = await Promise.all(
        chunks.map(async (chunk) => ({
          text: chunk.pageContent,
          vector: await this.embeddingService.generateEmbedding(
            chunk.pageContent,
          ),
        })),
      );

      // 更新进度到50%
      await this.updateProgress(redisKey, 'processing', 50);

      // 生成唯一chunk_id的逻辑
      const generateChunkId = (index: number) => {
        const timestamp = Date.now();
        const randomPart = Math.floor(Math.random() * 1000000);
        return parseInt(
          `${bookId}${timestamp}${randomPart}${index}`
            .replace(/\D/g, '')
            .slice(0, 15),
        );
      };

      // 插入向量数据
      const { success, insertedCount } = await this.milvusService.insertVectors(
        vectorsWithMetadata.map((v) => v.vector),
        {
          bookId,
          chunkTexts: vectorsWithMetadata.map((v) => v.text),
          chunkIds: vectorsWithMetadata.map((_, index) =>
            generateChunkId(index),
          ),
        },
      );

      // 标记完成
      await this.updateProgress(redisKey, 'completed', 100);
    } catch (e) {
      let errorMsg = e.message;
      if (e?.code === 1100) {
        errorMsg = `文本长度超过限制: ${e.detail}`;
      }
      await this.updateProgress(redisKey, 'failed', 0, errorMsg);
      console.error(`处理失败: ${errorMsg}`);
      throw e;
    }
  }
}
