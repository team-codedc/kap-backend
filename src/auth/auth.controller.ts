import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { AuthService } from './auth.service';
import { SocialTokenDto } from './dto';
import { RefreshTokenAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao')
  async kakaoLogin(@Body() socialTokenDto: SocialTokenDto) {
    return await this.authService.kakaoLogin(socialTokenDto);
  }

  @Post('google')
  async googleLogin(@Body() socialTokenDto: SocialTokenDto) {
    return await this.authService.googleLogin(socialTokenDto);
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Get('refresh')
  async refresh(@GetUser() user: User) {
    const accessToken = await this.authService.generateAccessToken(user.id);
    const { refreshToken } = await this.authService.generateRefreshTokenWithCookie(user.id);
    return { accessToken, refreshToken };
  }
}
