import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { log } from 'console';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipInterceptor = this.reflector.getAllAndOverride<boolean>(
      'skipInterceptor',
      [context.getHandler(), context.getClass()]
    );
    if (skipInterceptor) {
      // 跳过全局拦截器的处理
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        const message = data?.message;
        const code = data?.code;
        const error = data?.error;
        return {
          data: error ?? data.data,
          code: code ?? 200,
          msg: message ?? '请求成功',
        };
      }),
    );
  }
}
