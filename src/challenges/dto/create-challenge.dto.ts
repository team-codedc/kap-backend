import { IsEnum, IsString } from 'class-validator';
import { CHALLENGE_CATEGORY_TYPE, CHALLENGE_CATEGORY_TYPE_VALUES } from 'src/libs/constants';

export class CreateChallengeDto {
  @IsString()
  name: string;

  @IsString()
  rule: string;

  @IsString()
  description: string;

  @IsEnum(CHALLENGE_CATEGORY_TYPE_VALUES)
  category: CHALLENGE_CATEGORY_TYPE;
}
