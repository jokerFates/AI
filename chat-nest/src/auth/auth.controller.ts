import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from '@/common/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@/redis/redis.service';
import { ApiResponse } from '@/core/response/response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 注册
   * @param name 姓名
   * @param password 密码
   */
  @Public()
  @Post('logon')
  logon(@Body() logonData: CreateAuthDto) {
    return this.authService.logon(logonData);
  }

  /**
   * 登录
   * @param name 姓名
   * @param password 密码
   */
  @Public()
  @Post('login')
  login(@Body() loginData: CreateAuthDto) {
    return this.authService.login(loginData);
  }

  @Post('logout')
  @ApiBearerAuth()
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      // 获取令牌剩余有效时间
      const decoded = this.jwtService.decode(token) as { exp: number };
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);

      // 令牌剩余有效时间大于0才存储
      if (ttl > 0) {
        await this.redisService.setInvalidToken(token, ttl);
      }
    }
    return ApiResponse.success('退出成功');
  }
}
