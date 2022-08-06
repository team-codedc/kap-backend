import { IsNotEmpty, IsString } from 'class-validator';

export class SocialCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}
