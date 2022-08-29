import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AccessTokenAuthGuard } from 'src/auth/guards';
import { User } from 'src/entities';
import { GetUser } from 'src/libs/decorators';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto';

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @UseGuards(AccessTokenAuthGuard)
  @Get()
  getAllChallenge() {
    return this.challengesService.getChallenge();
  }

  @UseGuards(AccessTokenAuthGuard)
  @Get(':id')
  getChallengeByUserId(@Param('id') userId: string) {
    return this.challengesService.getChallengeByUserId(userId);
  }

  @UseGuards(AccessTokenAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'good', maxCount: 1 },
      { name: 'bad', maxCount: 1 },
    ]),
  )
  @Post()
  createChallenge(
    @GetUser() user: User,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createChallengeDto: CreateChallengeDto,
  ) {
    return this.challengesService.createChallenge(user, files, createChallengeDto);
  }
}
