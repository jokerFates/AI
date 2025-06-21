import { forwardRef, Module } from '@nestjs/common';
import { OpenAIController } from './openai.controller';
import { OpenAIService } from './openai.service';
import { BookModule } from '@/book/book.module';

@Module({
  imports: [forwardRef(() => BookModule)],
  controllers: [OpenAIController],
  providers: [OpenAIService],
})
export class OpenAIModule {}
