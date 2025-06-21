import { Controller, Post, Body, Res } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SkipInterceptor } from '@/common/skip.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { Response } from 'express';
import { CreateRewriteDto } from './dto/create-rewrite.dto';

@SkipInterceptor()
@ApiBearerAuth()
@Controller('openai')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {}

  @Post('chat')
  @ApiBody({
    type: CreateChatDto,
    description: '聊天请求参数',
  })
  async chat(@Body() createChatDto: CreateChatDto, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    await this.openAIService.getChatResponse(createChatDto, res);
  }

  @Post('summary')
  @ApiBody({
    type: CreateSummaryDto,
    description: '摘要生成请求参数',
  })
  async generateSummary(
    @Body() createSummaryDto: CreateSummaryDto,
    @Res() res: Response,
  ) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    await this.openAIService.generateSummary(createSummaryDto, res);
  }

  @Post('rewrite')
  @ApiBody({
    type: CreateRewriteDto,
    description: '文章改写请求参数',
  })
  async rewrite(@Body() dto: CreateRewriteDto, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Connection', 'keep-alive');
    await this.openAIService.handleRewrite(dto, res);
  }
}
