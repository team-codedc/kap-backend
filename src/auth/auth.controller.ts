import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { AuthService } from './auth.service';
import { SocialTokenDto } from './dto';
import { RefreshTokenAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  async kakaoLogin(
    @Body() socialTokenDto: SocialTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.kakaoLogin(socialTokenDto, res);
  }

  @Post('google')
  async googleLogin(
    @Body() socialTokenDto: SocialTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.googleLogin(socialTokenDto, res);
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Get('refresh')
  async refresh(@GetUser() user: User) {
    const accessToken = await this.authService.generateAccessToken(user.id);
    return { accessToken };
  }
}
