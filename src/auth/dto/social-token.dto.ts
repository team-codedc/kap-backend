import { IsNotEmpty, IsString } from 'class-validator';

export class SocialTokenDto {
  @IsNotEmpty()
  @IsString()
  socialAccessToken: string;
}
