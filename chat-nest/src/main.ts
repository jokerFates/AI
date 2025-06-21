import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import * as dotenv from 'dotenv';
import multer from 'multer';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(), // 修改这里
  );

  // 创建Swagger选项
  const options = new DocumentBuilder()
    .setTitle('chatGpt API')
    .setDescription('The description of API ')
    .setVersion('1.0')
    .addBearerAuth()
    // .addTag('example')
    .build();

  // 注册全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 启用自动类型转换
      whitelist: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, options, { include: [] });

  // 访问swagger http://localhost:8085/document#/
  SwaggerModule.setup('document', app, document);

  // 注册全局错误的过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  //解决跨域
  app.enableCors({
    origin: 'http://localhost:8081', // 允许的源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 允许的方法
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true, // 允许携带凭证
  });

  await app.listen(process.env.PORT ?? 8085);
}
bootstrap();
