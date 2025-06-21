import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { jwtAuthGuard } from './auth/jwt-auth.grard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfig from '../config/env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookModule } from './book/book.module';
import { Book } from './book/entities/book.entity';
import { AuthModule } from './auth/auth.module';
import { Auth } from './auth/entities/auth.entity';
import { HttpExceptionFilter } from './core/filter/http-exception/http-exception.filter';
import { OpenAIModule } from './openai/openai.module';
import { TransformInterceptor } from './core/interceptor/transform/transform.interceptor';
import { SessionModule } from './session/session.module';
import { Session } from './session/entities/session.entity';
import { RedisCacheModule } from './redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteModule } from './note/note.module';
import { NoteLocationsModule } from './note-locations/note-locations.module';
import { Note } from './note/entities/note.entity';
import { NoteLocation } from './note-locations/entities/note-location.entity';
import { MilvusModule } from '@/milvus/milvus.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envConfig.path],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        entities: [Book, Auth, Session, Note, NoteLocation],
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWD'),
        database: configService.get('DB_DATABASE'),
        timezone: '+08:00',
        synchronize: true,
      }),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/book'),
    RedisCacheModule,
    BookModule,
    AuthModule,
    OpenAIModule,
    SessionModule,
    NoteModule,
    NoteLocationsModule,
    MilvusModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      }
    }),
    BullModule.registerQueue({
      name: 'vector',
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: jwtAuthGuard,
    },
    // 在这里配置CORS
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
