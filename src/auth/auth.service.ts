import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as qs from 'qs';
import { KAKAO_TOKEN_URL, KAKAO_USER_INFO_URL, SOCIAL_TYPE } from 'src/libs/constants';
import { SocialCodeDto } from './dto';
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

  public async register(
    socialId: string,
    email: string | null,
    name: string,
    socialType: SOCIAL_TYPE,
  ) {
    try {
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

  public async kakaoLogin(socialCodeDto: SocialCodeDto, res: Response) {
    const { code } = socialCodeDto;
    const body = {
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
      client_secret: this.configService.get<string>('KAKAO_CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
      code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    try {
      const responseToken = await axios({
        method: 'POST',
        url: KAKAO_TOKEN_URL,
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + responseToken.data.access_token,
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
      throw new UnauthorizedException('유효한 인증코드가 아니에요');
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
