import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { ApiResponse } from '@/core/response/response';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly auth: Repository<Auth>,
    private readonly jwtService: JwtService,
  ) {}

  // 注册
  async logon(logonData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: logonData.username },
    });
    if (findUser && findUser.username === logonData.username)
      return ApiResponse.fail('用户已存在');
    // 对密码进行加密处理
    logonData.password = bcryptjs.hashSync(logonData.password, 10);
    await this.auth.save(logonData);
    // 尝试将注册成功的用户存入redis中
    return ApiResponse.success('注册成功');
  }

  // 登录
  async login(loginData: CreateAuthDto) {
    const findUser = await this.auth.findOne({
      where: { username: loginData.username },
    });
    // 没有找到
    if (!findUser) return ApiResponse.fail('用户不存在');

    // 找到了对比密码
    const compareRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password,
    );

    // 密码不正确
    if (!compareRes) return ApiResponse.fail('密码错误');
    const payload = { username: findUser.username };
    const res = {
      token: this.jwtService.sign(payload),
      username: loginData.username,
      id: findUser.id,
    };

    return ApiResponse.success('登录成功', res);
  }
}
