import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Challenge, ChallengeMember, User } from 'src/entities';
import { UploadsService } from 'src/uploads/uploads.service';
import { Repository } from 'typeorm';
import { CreateChallengeDto } from './dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(ChallengeMember)
    private readonly challengeMemberRepository: Repository<ChallengeMember>,
    public readonly uploadsService: UploadsService,
  ) {}

  public async getChallenge() {
    return this.challengeRepository.find({
      relations: ['host', 'members.user'],
      order: { createdAt: 'DESC' },
    });
  }

  public async getChallengeByUserId(hostId: string) {
    const challenge = await this.challengeRepository.find({
      relations: ['host', 'members.user'],
      where: { host: { id: hostId } },
      order: { createdAt: 'DESC' },
    });
    return challenge;
  }

  public async getChallengeByChallengeId(challengeId: string) {
    const challenge = await this.challengeRepository.findOne({
      relations: ['host', 'members.user'],
      where: { id: challengeId },
    });
    return challenge;
  }

  public async getJoinChallengeByUserId(userId: string) {
    const challenge = await this.challengeRepository.find({
      where: [{ members: { user: { id: userId } } }],
    });
    console.log(challenge);
    return challenge;
  }

  public async findChallengeByUserId(id: string, challengeId: string) {
    const challenge = await this.challengeRepository.findOne({
      where: [{ id: challengeId, members: { user: { id } } }],
    });
    return challenge;
  }

  public async createChallenge(
    user: User,
    // file: Express.Multer.File,
    createChallengeDto: CreateChallengeDto,
  ) {
    // if (!file) throw new BadRequestException('사진을 입력해주세요');
    try {
      // const image = await this.uploadsService.upload(file);
      const { name, rule, description, category, lat, lng } = createChallengeDto;

      const challenge = await this.challengeRepository.create({
        imageUrl: 'default',
        name,
        rule,
        description,
        lat,
        lng,
        category,
        host: user,
        members: [],
      });
      await this.challengeRepository.save(challenge);

      const member = await this.challengeMemberRepository.create({
        challenge,
        user: user,
      });
      await this.challengeMemberRepository.save(member);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('일시적인 오류가 발생했어요');
    }
  }

  public async joinChallenge(challengeId: string, user: User) {
    const userChallenge = await this.findChallengeByUserId(user.id, challengeId);
    if (userChallenge) throw new BadRequestException('이미 참여 중인 챌린지에요');

    const challenge = await this.challengeRepository.findOne({
      relations: ['host', 'members', 'members.user'],
      where: { id: challengeId },
    });

    const member = await this.challengeMemberRepository.create({
      user: user,
      challenge: challenge,
    });

    challenge.members.push(member);

    await this.challengeRepository.save(challenge);
    await this.challengeMemberRepository.save(member);
  }

  public async deleteChallengeByChallengeId(challengeId: string, user: User) {
    const challenge = await this.getChallengeByChallengeId(challengeId);
    if (user.id !== challenge.host.id)
      throw new ForbiddenException('챌린지를 삭제할 권한이 없어요');
    await this.challengeRepository.delete(challengeId);
  }
}
