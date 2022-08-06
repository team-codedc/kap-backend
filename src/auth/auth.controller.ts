import { Body, Controller, Get, Post, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { SocialCodeDto } from './dto';
import { RefreshTokenAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('kakao')
  async login(@Body() socialCodeDto: SocialCodeDto, @Res({ passthrough: true }) res: Response) {
    try {
      const { code } = socialCodeDto;
      const kakaoUser = await this.authService.kakaoLogin(code);
      const kakaoUsersCount = await this.userRepository.count({
        where: kakaoUser.id,
      });
      if (kakaoUsersCount <= 0) {
        await this.authService.register(
          kakaoUser.id,
          kakaoUser.kakao_account.email,
          kakaoUser.kakao_account.profile.nickname,
        );
      }
      const user = await this.userRepository.findOne({
        where: kakaoUser.id,
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
