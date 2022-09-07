import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Challenge } from './challenge.entity';

@Entity('challenge_tag')
export class ChallengeTag extends BaseEntity {
  @Column({ type: 'varchar' })
  keyword: string;

  @ManyToOne(() => Challenge, (challenge) => challenge.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;
}
