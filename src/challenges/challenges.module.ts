import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge, ChallengeTag } from 'src/entities';
import { UploadsModule } from 'src/uploads/uploads.module';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge, ChallengeTag]), UploadsModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
