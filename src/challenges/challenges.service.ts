import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
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
    return this.challengeRepository.find({
      relations: ['host'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getChallengeByUserId(hostId: string) {
    const challenge = await this.challengeRepository.find({
      relations: ['host'],
      where: { host: { id: hostId } },
      order: { createdAt: 'DESC' },
    });
    return challenge;
  }

  public async getChallengeByChallengeId(challengeId: string) {
    const challenge = await this.challengeRepository.findOne({
      relations: ['host'],
      where: { id: challengeId },
    });
    return challenge;
  }

  public async createChallenge(
    user: User,
    file: Express.Multer.File,
    createChallengeDto: CreateChallengeDto,
  ) {
    if (!file) throw new BadRequestException('사진을 입력해주세요');
    try {
      const image = await this.uploadsService.upload(file);
      const { name, rule, description, category } = createChallengeDto;

      const challenge = await this.challengeRepository.create({
        imageUrl: image.url,
        name,
        rule,
        description,
        category,
        host: user,
      });
      await this.challengeRepository.save(challenge);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }
}
