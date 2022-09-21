import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CHALLENGE_CATEGORY_TYPE, CHALLENGE_CATEGORY_TYPE_VALUES } from 'src/libs/constants';

export class CreateChallengeDto {
  @IsNotEmpty()
  @IsString()
  name: any;

  @IsNotEmpty()
  @IsString()
  rule: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(CHALLENGE_CATEGORY_TYPE_VALUES)
  category: CHALLENGE_CATEGORY_TYPE;
}
