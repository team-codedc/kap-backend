import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @Get('detail/:id')
  getChallengeByChallengeId(@Param('id') challengeId: string) {
    return this.challengesService.getChallengeByChallengeId(challengeId);
  }

  @UseGuards(AccessTokenAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  createChallenge(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() createChallengeDto: CreateChallengeDto,
  ) {
    return this.challengesService.createChallenge(user, file, createChallengeDto);
  }
}
