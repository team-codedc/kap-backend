import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { sub: id, name, email } = profile._json;

    const googleUsersCount = await this.usersService.getCountBySocialId(id, 'GOOGLE');
    if (googleUsersCount <= 0) {
      await this.authService.register(id, email, name, 'GOOGLE');
    }
    const user = await this.usersService.getUserBySocialId(id, 'GOOGLE');
    return user;
  }
}
