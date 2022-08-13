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
import axios from 'axios';
import { GOOGLE_USER_INFO_URL, KAKAO_USER_INFO_URL, SOCIAL_TYPE } from 'src/libs/constants';
import { SocialTokenDto } from './dto';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';

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
      await this.userRepository.save(user);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public async kakaoLogin(socialTokenDto: SocialTokenDto, res: Response) {
    const { socialAccessToken } = socialTokenDto;
    try {
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + socialAccessToken,
      };
      const responseUserInfo = await axios({
        method: 'GET',
        url: KAKAO_USER_INFO_URL,
        timeout: 30000,
        headers: headerUserInfo,
      });
      const kakaoUser = responseUserInfo.data;
      const kakaoUsersCount = await this.usersService.getCountBySocialId(kakaoUser.id);
      if (kakaoUsersCount <= 0) {
        await this.register(
          kakaoUser.id,
          kakaoUser.kakao_account.email,
          kakaoUser.kakao_account.profile.nickname,
          'KAKAO',
        );
      }
      const user = await this.usersService.getUserBySocialId(kakaoUser.id);
      const accessToken = await this.generateAccessToken(user.id);
      const { refreshToken, ...refreshOption } = this.generateRefreshTokenWithCookie(user.id);
      res.cookie('Refresh', refreshToken, refreshOption);
      return { accessToken: accessToken };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public async googleLogin(socialCodeDto: SocialTokenDto, res: Response) {
    const { socialAccessToken } = socialCodeDto;
    try {
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + socialAccessToken,
      };
      const responseUserInfo = await axios({
        method: 'GET',
        url: GOOGLE_USER_INFO_URL,
        timeout: 30000,
        headers: headerUserInfo,
      });
      const googleUser = responseUserInfo.data;
      const googleUsersCount = await this.usersService.getCountBySocialId(googleUser.id);
      if (googleUsersCount <= 0) {
        await this.register(googleUser.id, googleUser.email, googleUser.name, 'GOOGLE');
      }
      const user = await this.usersService.getUserBySocialId(googleUser.id);
      const accessToken = await this.generateAccessToken(user.id);
      const { refreshToken, ...refreshOption } = this.generateRefreshTokenWithCookie(user.id);
      res.cookie('Refresh', refreshToken, refreshOption);
      return { accessToken: accessToken };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public generateAccessToken(id: string) {
    const accessToken = this.jwtService.sign(
      { sub: id },
      {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: parseInt(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')),
      },
    );
    return accessToken;
  }

  public generateRefreshTokenWithCookie(id: string) {
    const token = this.jwtService.sign(
      { sub: id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN')),
      },
    );
    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: parseInt(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN')) * 1000,
    };
  }
}
