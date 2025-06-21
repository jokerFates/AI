import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { BookService } from '@/book/service/book.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { CreateRewriteDto } from './dto/create-rewrite.dto';

@Injectable()
export class OpenAIService {
  private readonly apiKey: string = process.env.OPENAI_API_KEY;
  private readonly apiUrl: string = process.env.OPENAI_API_URL;

  constructor(private bookService: BookService) {}

  // 公共流处理逻辑
  private async handleStream(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    res: Response,
    temperature: number = 0.3,
    model: string,
  ) {
    const client = new OpenAI({
      baseURL: this.apiUrl,
      apiKey: this.apiKey,
    });

    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      res.write(content);
    }
    res.end();
  }

  // 统一消息构造逻辑
  private async buildMessages(
    dto: CreateChatDto | CreateSummaryDto | CreateRewriteDto,
    type: 'chat' | 'summary' | 'rewrite' = 'chat',
  ) {
    let messages = dto.sessions;

    if (type !== 'chat') {
      const bookId = (dto as CreateSummaryDto | CreateRewriteDto).bookId;
      const content = await this.bookService[
        type === 'summary' ? 'generateSummary' : 'rewriteArticle'
      ](+bookId, dto.sessions[dto.sessions.length - 1].content);

      messages = [{ role: 'user', content }, ...dto.sessions];
    } else {
      // 获取历史提问（过滤掉系统消息）
      const historyQuestions = dto.sessions
        .filter((s) => s.role === 'user')
        .map((s) => s.content)
        .slice(-5); // 取最近5条历史问题

      // 合并历史与当前问题生成向量
      const queryTexts = [
        ...historyQuestions,
        dto.sessions.slice(-1)[0].content,
      ];
      const prompt = await this.bookService.processVectorTask(queryTexts);
      messages = [{ role: 'user', content: prompt }, ...dto.sessions];
    }

    return messages;
  }

  async getChatResponse(dto: CreateChatDto, res: Response) {
    const messages = await this.buildMessages(dto, 'chat');
    await this.handleStream(messages, res, 0.3, dto.modal);
  }

  async generateSummary(dto: CreateSummaryDto, res: Response) {
    const messages = await this.buildMessages(dto, 'summary');
    await this.handleStream(messages, res, 0.3, dto.modal);
  }

  async handleRewrite(dto: CreateRewriteDto, res: Response) {
    const messages = await this.buildMessages(dto, 'rewrite');
    await this.handleStream(messages, res, 0.7, dto.modal);
  }
}
