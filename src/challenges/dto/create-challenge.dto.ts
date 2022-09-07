import { IsEnum, IsString } from 'class-validator';
import {
  CHALLENGE_CATEGORY_TYPE,
  CHALLENGE_CATEGORY_TYPE_VALUES,
  CHALLENGE_FREQUENCY_TYPE,
  CHALLENGE_FREQUENCY_TYPE_VALUES,
} from 'src/libs/constants';

export class CreateChallengeDto {
  @IsString()
  name: string;

  @IsString()
  rule: string;

  @IsString()
  description: string;

  @IsEnum(CHALLENGE_FREQUENCY_TYPE_VALUES)
  certificationFrequency: CHALLENGE_FREQUENCY_TYPE;

  @IsString()
  certificationPerDay: string;

  @IsString()
  certificableStartTime: string;

  @IsString()
  certificableFinishTime: string;

  @IsString()
  startDate: string;

  @IsString()
  finishDate: string;

  @IsEnum(CHALLENGE_CATEGORY_TYPE_VALUES)
  category: CHALLENGE_CATEGORY_TYPE;

  @IsString({ each: true })
  keyword: string[];
}
