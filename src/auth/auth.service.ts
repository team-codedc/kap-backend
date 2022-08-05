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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(socialId: string, email: string | null, nickname: string) {
    try {
      const user = this.userRepository.create({
        socialId,
        email,
        nickname,
        type: 'kakao',
      });
      await this.userRepository.save(user);
      return;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public async kakaoLogin(code: string) {
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      client_secret: process.env.KAKAO_CLIENT_SECRET,
      redirect_uri: process.env.KAKAO_REDIRECT_URI,
      code,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    try {
      const responseToken = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        timeout: 30000,
        headers,
        data: qs.stringify(body),
      });
      if (responseToken.status !== 200) throw new UnauthorizedException();
      const headerUserInfo = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Authorization: 'Bearer ' + responseToken.data.access_token,
      };
      const responseUserInfo = await axios({
        method: 'GET',
        url: kakaoUserInfoUrl,
        timeout: 30000,
        headers: headerUserInfo,
      });
      if (responseUserInfo.status !== 200) throw new UnauthorizedException();
      return responseUserInfo.data;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  public async generateAccessToken(id: string) {
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: id },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
          expiresIn: parseInt(this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN')),
        },
      ),
    ]);
    return accessToken;
  }

  public generateRefreshTokenWithCookie(id: string) {
    const payload = { id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });

    return {
      refreshToken: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      maxAge: Number(this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')) * 1000,
    };
  }
}
