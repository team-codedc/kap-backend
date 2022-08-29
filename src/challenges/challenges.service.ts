import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challenge, User } from 'src/entities';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { CreateChallengeDto } from './dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    public readonly uploadsService: UploadsService,
  ) {}

  public async getChallenge() {
    return this.challengeRepository.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  public async getChallengeByUserId(userId: string) {
    const challenge = await this.challengeRepository.find({
      relations: ['user'],
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return challenge;
  }

  public async createChallenge(
    user: User,
    files: Array<Express.Multer.File>,
    createChallengeDto: CreateChallengeDto,
  ) {
    try {
      const good = files['good'][0];
      const goodImage = await this.uploadsService.upload(good);
      const bad = files['bad'][0];
      const badImage = await this.uploadsService.upload(bad);

      const {
        name,
        rule,
        description,
        certificationFrequency,
        certificationPerDay,
        certificableStartTime,
        certificableFinishTime,
        startDate,
        finishDate,
        category,
      } = createChallengeDto;

      const challenge = await this.challengeRepository.create({
        goodExampleImageUrl: goodImage.url,
        badExampleImageUrl: badImage.url,
        name,
        rule,
        description,
        certificationFrequency,
        certificationPerDay,
        certificableStartTime,
        certificableFinishTime,
        startDate,
        finishDate,
        category,
        user: user,
      });

      await this.challengeRepository.save(challenge);

      return challenge;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }
}
