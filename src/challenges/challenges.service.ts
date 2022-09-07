import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challenge, User, ChallengeTag } from 'src/entities';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { CreateChallengeDto } from './dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeTag)
    private readonly tagRepository: Repository<ChallengeTag>,
    public readonly uploadsService: UploadsService,
  ) {}

  public async getChallenge() {
    return this.challengeRepository.find({
      relations: ['host', 'tags'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getChallengeByUserId(hostId: string) {
    const challenge = await this.challengeRepository.find({
      relations: ['host', 'tags'],
      where: { host: { id: hostId } },
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
        keyword,
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
        tags: [],
        host: user,
      });

      await this.challengeRepository.save(challenge);
      for (let i = 0; i < keyword.length; i++) {
        const tag = await this.tagRepository.create({
          challenge,
          keyword: keyword[i],
        });
        await this.tagRepository.save(tag);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }
}
