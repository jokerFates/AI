import { jwtConstants } from '@/common/constant';
import { RedisService } from '@/redis/redis.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  username: string;
}

@Injectable()
// 验证请求头中的token
export default class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
       passReqToCallback: true
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const isInvalid = await this.redisService.isTokenInvalid(
      this.getTokenFromRequest(req),
    );

    if (isInvalid) {
      throw new UnauthorizedException('令牌已失效');
    }

    return { username: payload.username };
  }

  // 新增私有方法获取当前令牌
  private getTokenFromRequest(req: Request): string {
    return req.headers.authorization?.split(' ')[1] || '';
  }
}
