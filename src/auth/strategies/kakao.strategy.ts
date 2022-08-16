import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

interface KakaoUserProfile {
  id: string;
  has_signed_up: boolean;
  connected_at: Date;
  synched_at: Date;
  properties: object;
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url: string;
      profile_image_url: string;
      is_default_image: boolean;
    };
    has_email: boolean;
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email: string;
    has_age_range: boolean;
    age_range_needs_agreement: boolean;
    has_birthday: boolean;
    birthday_needs_agreement: boolean;
    has_gender: boolean;
    gender_needs_agreement: boolean;
  };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  private KAKAO_USER_PROFILE_URL = 'https://kapi.kakao.com/v2/user/me';

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(req: Request) {
    const accessToken = req.query.code;
    if (!accessToken) throw new BadRequestException('인가코드를 찾을 수 없어요');

    try {
      const { data } = await axios.get<KakaoUserProfile>(this.KAKAO_USER_PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      const { id, kakao_account } = data;

      const kakaoUserCount = await this.usersService.getCountBySocialId(id);
      if (kakaoUserCount <= 0) {
        await this.authService.register(
          id,
          kakao_account.email,
          kakao_account.profile.nickname,
          'KAKAO',
        );
      }

      const user = await this.usersService.getUserBySocialId(id);
      return user;
    } catch (error) {
      if (error instanceof AxiosError)
        throw new BadRequestException(
          `카카오 서버와 통신 중 오류가 발생했어요: ${error.response.data}`,
        );
      throw error;
    }
  }
}
