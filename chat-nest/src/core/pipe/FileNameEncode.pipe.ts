import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { log } from 'console';

@Injectable()
export class FileNameEncodePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 检查是否是文件参数（通过 metatype 判断）
    if (
      metadata?.metatype &&
      metadata.metatype.name === 'Object' // 检查是否为 Multer 文件类型
    ) {
      if (!/[^\u0000-\u00ff]/.test(value.originalname)) {
        value.originalname = Buffer.from(value.originalname, 'latin1').toString('utf8');
      }
    }
    return value;
  }
}