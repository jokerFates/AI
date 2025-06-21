import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const res = await this.sessionRepository.save(createSessionDto);
    return res;
  }

  async findAllByUser(user: string) {
    const res = await this.sessionRepository.find({
      where: { user },
      order: { update_time: 'DESC' },
    });
    return res;
  }

  async findOne(id: number) {
    const res = await this.sessionRepository.findOneBy({ id });
    if (res === null) return { chat: '[]' };
    return res;
  }

  async update(id: number, updateSessionDto: UpdateSessionDto) {
    const res = await this.sessionRepository.update(
      { id },
      {
        ...updateSessionDto,
        update_time: new Date(), // 自动设置更新时间
      },
    );
    return res;
  }

  async remove(id: number) {
    const res = await this.sessionRepository.delete({ id: id });
    return res;
  }
}
