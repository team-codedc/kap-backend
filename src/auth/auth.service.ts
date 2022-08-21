import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SOCIAL_TYPE } from 'src/libs/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(socialId: string, email: string, name: string, socialType: SOCIAL_TYPE) {
    try {
      const isAlreadyExistUser = await this.usersService.getUserBySocialEmail(email);

      if (isAlreadyExistUser)
        throw new ConflictException(
          `이미 ${isAlreadyExistUser.socialType}에서 사용중인 이메일이에요`,
        );

      const user = this.userRepository.create({
        socialId,
        email,
        name,
        socialType,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public socialLogin(user: User) {
    try {
      const { id } = user;
      const accessToken = this.issueToken({ id }, true);
      const refreshToken = this.issueToken({ id }, false);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public issueToken(payload: { id: string }, isAccessToken: boolean) {
    const secret = this.configService.get<string>(
      isAccessToken ? 'JWT_ACCESS_TOKEN_SECRET_KEY' : 'JWT_REFRESH_TOKEN_SECRET_KEY',
    );
    const expiresIn = parseInt(
      this.configService.get<string>(
        isAccessToken ? 'JWT_ACCESS_TOKEN_EXPIRES_IN' : 'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ),
    );

    const token = this.jwtService.sign({ sub: payload.id }, { secret, expiresIn });
    return token;
  }
}
