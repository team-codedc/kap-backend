import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, KakaoAuthGuard, RefreshTokenAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(KakaoAuthGuard)
  @Post('kakao')
  kakaoLogin(@Req() req: Request) {
    return this.authService.socialLogin(req.user as User);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin(@Req() req: Request) {
    return this.authService.socialLogin(req.user as User);
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Get('refresh')
  refresh(@GetUser() user: User) {
    const accessToken = this.authService.issueToken({ id: user.id }, true);
    const refreshToken = this.authService.issueToken({ id: user.id }, false);
    return { accessToken, refreshToken };
  }
}
