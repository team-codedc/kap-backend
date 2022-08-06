import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as qs from 'qs';
import { KAKAO_TOKEN_URL, KAKAO_USER_INFO_URL } from 'src/libs/constants/url';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(socialId: string, email: string | null, name: string) {
    try {
      const user = this.userRepository.create({
        socialId,
        email,
        name,
        socialType: 'KAKAO',
      });
      await this.userRepository.save(user);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public async kakaoLogin(code: string) {
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
      return responseUserInfo.data;
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
