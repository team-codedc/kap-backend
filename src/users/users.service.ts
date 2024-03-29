import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { SOCIAL_TYPE } from 'src/libs/constants';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('유저 정보를 찾을 수 없어요');
    return user;
  }

  public async getCountBySocialId(id: string, type: SOCIAL_TYPE) {
    const user = await this.userRepository.count({ where: { socialId: id, socialType: type } });
    return user;
  }

  public async getUserBySocialId(id: string, type: SOCIAL_TYPE) {
    const user = await this.userRepository.findOne({ where: { socialId: id, socialType: type } });
    if (!user) throw new NotFoundException('유저 정보를 찾을 수 없어요');
    return user;
  }

  public async getUserBySocialEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    return user;
  }

  public async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const { name, nickname, birth } = updateUserDto;
      const user = await this.getUserById(userId);
      user.updatedAt = new Date();
      user.name = name;
      user.nickname = nickname;
      user.birth = birth;
      this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }
}
