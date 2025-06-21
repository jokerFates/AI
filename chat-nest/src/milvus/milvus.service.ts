import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataType, MilvusClient } from '@zilliz/milvus2-sdk-node';
import { log } from 'console';

@Injectable()
export class MilvusService implements OnModuleInit {
  private client: MilvusClient;
  private collectionName = 'books';
  public static readonly MAX_TEXT_LENGTH = 1024;

  constructor() {
    // 从环境变量获取 Milvus 连接配置
    const config = {
      address: process.env.MILVUS_ADDRESS || 'localhost:19530',
      username: process.env.MILVUS_USERNAME || '',
      password: process.env.MILVUS_PASSWORD || '',
      ssl: process.env.MILVUS_USE_SSL === 'true',
    };

    this.client = new MilvusClient(config);
  }

  async onModuleInit() {
    await this.initializeCollection();
    log('MilvusService 初始化');
  }

  private async initializeCollection() {
    const fields = [
      { name: 'book_id', data_type: DataType.Int64, is_primary_key: false },
      { name: 'chunk_id', data_type: DataType.Int64, is_primary_key: true }, // 新增片段ID
      {
        name: 'chunk_text',
        data_type: DataType.VarChar,
        type_params: { max_length: '10000' },
      }, // 存储原始文本片段
      {
        name: 'embedding',
        data_type: DataType.FloatVector,
        type_params: { dim: '768' },
      },
    ];
    try {
      const res = await this.client.hasCollection({
        collection_name: this.collectionName,
      });

      if (!res.value) {
        // 创建符合图书特征的集合
        await this.client.createCollection({
          collection_name: this.collectionName,
          fields,
        });

        // 创建索引
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          index_type: 'HNSW',
          metric_type: 'COSINE',
          params: { M: 16, efConstruction: 300 },
        });
      }

      // 加载集合
      await this.client.loadCollectionSync({
        collection_name: this.collectionName,
      });
    } catch (error) {
      console.error('集合初始化失败:', error);
      throw new Error('Milvus初始化失败');
    }
  }

  async insertVectors(
    vectors: number[][],
    options: {
      bookId: number;
      chunkTexts: string[];
      chunkIds: number[];
    },
  ) {
    if (!vectors?.length || vectors.some((v) => !v?.length)) {
      throw new Error('无效的向量数据');
    }

    if (
      vectors.length !== options.chunkTexts.length ||
      vectors.length !== options.chunkIds.length
    ) {
      throw new Error('向量与元数据数量不匹配');
    }

    const rows = vectors.map((vector, index) => ({
      book_id: options.bookId,
      chunk_id: options.chunkIds[index],
      chunk_text: options.chunkTexts[index],
      embedding: vector,
    }));

    const result = await this.client.insert({
      collection_name: this.collectionName,
      data: rows,
    });
    return {
      success: result.status.error_code === 'Success',
      insertedCount: result.insert_cnt,
    };
  }

  async searchVectors(queryVector: number[], topK = 5) {
    const searchParams = {
      collection_name: this.collectionName,
      data: [queryVector],
      limit: topK,
    };
    try {
      const res = await this.client.search({ ...searchParams });
      return (
        res.results?.map((item) => ({
          book_id: Number(item.book_id)
        })) || []
      );
    } catch (error) {
      console.error('向量搜索失败:', error);
      return [];
    }
  }

  async searchChunkVectors(
    queryVector: number[],
    topK = 10,
  ) {
    const res = await this.client.search({
      collection_name: this.collectionName,
      output_fields: ['book_id', 'chunk_id', 'chunk_text'],
      data: [queryVector],
      limit: topK,
    });
    // 过滤低质量匹配
    return (
      res.results
        ?.map((item) => ({
          book_id: Number(item.book_id),
          chunk_id: Number(item.chunk_id),
          text: item.chunk_text,
        })) || []
    );
  }

  async deleteVectorsByBookId(bookId: number) {
    try {
      await this.client.deleteEntities({
        collection_name: this.collectionName,
        expr: `book_id == ${bookId}`, // 构造删除表达式
      });
      return true;
    } catch (error) {
      console.error(`删除向量数据失败 [bookId:${bookId}]:`, error);
      return false;
    }
  }
}
