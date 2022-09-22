import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { get } from 'http';
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
  @Get('join/:id')
  getJoinChallengeByUserId(@Param('id') userId: string) {
    return this.challengesService.getJoinChallengeByUserId(userId);
  }

  @UseGuards(AccessTokenAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  createChallenge(
    @GetUser() user: User,
    // @UploadedFile() file: Express.Multer.File,
    @Body() createChallengeDto: CreateChallengeDto,
  ) {
    return this.challengesService.createChallenge(user, createChallengeDto);
  }

  @UseGuards(AccessTokenAuthGuard)
  @Post('join/:id')
  joinChallenge(@GetUser() user: User, @Param('id') challengeId: string) {
    return this.challengesService.joinChallenge(challengeId, user);
  }

  @UseGuards(AccessTokenAuthGuard)
  @Delete(':id')
  deleteChallengeByChallengeId(@GetUser() user: User, @Param('id') challengeId: string) {
    return this.challengesService.deleteChallengeByChallengeId(challengeId, user);
  }
}
