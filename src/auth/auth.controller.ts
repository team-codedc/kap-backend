import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { RefreshTokenAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('kakao')
  async login(@Body() body, @Res({ passthrough: true }) res) {
    try {
      const { code } = body;
      if (!code) {
        throw new BadRequestException('not null');
      }
      const kakaoUserInfo = await this.authService.kakaoLogin(code);
      const kakaoUser = await this.userRepository.count({
        where: kakaoUserInfo.id,
      });
      if (!kakaoUser)
        await this.authService.register(
          kakaoUserInfo.id,
          kakaoUserInfo.kakao_account.email,
          kakaoUserInfo.kakao_account.profile.nickname,
        );
      const user = await this.userRepository.findOne({
        where: kakaoUserInfo.id,
      });
      const accessToken = await this.authService.generateAccessToken(user.id);
      const { refreshToken, ...refreshOption } = this.authService.generateRefreshTokenWithCookie(
        user.id,
      );
      res.cookie('Refresh', refreshToken, refreshOption);
      return { accessToken: accessToken };
    } catch (error) {
      throw new UnauthorizedException('올바른 인증코드가 아니에요');
    }
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Get('refresh')
  async refresh(@GetUser() user: User) {
    const accessToken = await this.authService.generateAccessToken(user.id);
    return { accessToken };
  }
}
