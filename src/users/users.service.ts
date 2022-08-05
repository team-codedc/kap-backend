import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUserProfile(id: string) {
    const user = await this.getUserById(id);
    return user;
  }

  public async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('유저 정보를 찾을 수 없어요');
    return user;
  }

  public async getUserByKakaoId(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    return user;
  }
}
