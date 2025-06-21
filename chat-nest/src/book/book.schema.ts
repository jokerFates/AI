import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class FileEntity extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ 
    required: true, 
    unique: true,
    index: true // 添加索引声明
  })
  md5: string;

  @Prop({ required: true })
  content: Buffer;

  @Prop({ required: true })
  uploadDate: Date;

  @Prop({ required: true })
  length: number;

  
  @Prop({ type: String })
  html?: string; // 新增HTML内容字段
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);