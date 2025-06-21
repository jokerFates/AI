import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ApiResponse } from '@/core/response/response';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    const res = await this.sessionService.create(createSessionDto);
    return ApiResponse.success('', res.id);
  }

  @Get('list/:user')
  @ApiParam({ name: 'user' })
  async findAll(@Param() params: { user: string }) {
    const res = await this.sessionService.findAllByUser(params.user);
    return ApiResponse.success('', res);
  }

  @Post('update/:id')
  @ApiParam({ name: 'id' })
  async update(@Param() params: { id: string }, @Body() dto: UpdateSessionDto) {
    const res = await this.sessionService.update(Number(params.id), dto);
    return ApiResponse.success('', res.affected);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.sessionService.findOne(+id);
    return ApiResponse.success('', res);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.sessionService.remove(+id);
    return ApiResponse.success('', res);
  }
}
