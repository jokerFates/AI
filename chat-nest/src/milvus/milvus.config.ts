import { registerAs } from '@nestjs/config';

export default registerAs('milvus', () => ({
  host: process.env.MILVUS_HOST || 'localhost',
  port: process.env.MILVUS_PORT || '19530',
  user: process.env.MILVUS_USER || '',
  password: process.env.MILVUS_PASSWORD || '',
}));