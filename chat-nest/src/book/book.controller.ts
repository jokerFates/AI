import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { BookService } from './service/book.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiProduces,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileNameEncodePipe } from '@/core/pipe/fileNameEncode.pipe';
import { MergeDto } from './dto/merge.dto';
import { ApiResponse } from '@/core/response/response';
import { UpdateBookTitleDto } from './dto/update-book-title.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new FileNameEncodePipe())
  @ApiBearerAuth()
  @ApiBody({
    description: '上传文章',
    type: CreateBookDto,
  })
  async uploadFile(
    @Body() body: CreateBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.bookService.handleUpload(file, body);
  }

  @Post('update-title/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '书籍ID' })
  async updateTitle(@Param('id') id: number, @Body() dto: UpdateBookTitleDto) {
    const result = await this.bookService.updateTitle(id, dto.title);
    return ApiResponse.success('修改成功', result);
  }

  // 判断文件是否存在
  @Get('existed/:md5')
  @ApiBearerAuth()
  @ApiParam({ name: 'md5', description: '文件MD5' })
  @ApiQuery({ name: 'username', description: '用户名', required: true })
  async checkFileExisted(
    @Param('md5') md5: string,
    @Query('username') username: string,
  ) {
    return await this.bookService.checkFileExisted(md5, username);
  }

  // 合并切片
  @Post('merge')
  @ApiBearerAuth()
  async mergeFile(@Body() body: MergeDto) {
    return await this.bookService.mergeFile(body);
  }

  @Get('check/:md5')
  @ApiBearerAuth()
  async checkFile(@Param('md5') md5: string) {
    return await this.bookService.checkFile(md5);
  }

  @Get('list')
  @ApiBearerAuth()
  @ApiQuery({ name: 'user', description: '用户名', required: true })
  @ApiQuery({ name: 'title', description: '搜索标题', required: false })
  async getBookList(
    @Query('user') user: string,
    @Query('title') title?: string,
  ) {
    const result = await this.bookService.getBookList(user, title);
    return ApiResponse.success('', result);
  }

  @Delete('delete/:id')
  @ApiBearerAuth()
  async deleteBook(@Param('id') id: number) {
    await this.bookService.deleteBook(id);
    return ApiResponse.success('删除成功');
  }

  @Get('preview/:id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: '书籍ID', type: Number })
  @ApiProduces('application/octet-stream', 'text/plain', 'application/json')
  async previewBookFile(@Param('id') bookId: number) {
    const result = await this.bookService.getFileContentByBookId(bookId);

    return ApiResponse.success('', {
      html: result.html,
      filename: result.meta.filename,
      fileType: result.meta.fileType,
      fileExtension: result.meta.fileExtension,
    });
  }

  // 查询向量化任务队列进度
  @Get('task-status/:bookId')
  @ApiParam({ name: 'bookId', description: '书籍ID' })
  async getVectorTaskStatus(@Param('bookId') bookId: number) {
    const result = await this.bookService.getVectorProgress(bookId);
    return ApiResponse.success('', result);
  }
}
