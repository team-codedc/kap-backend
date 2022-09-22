import { Entity, JoinColumn, ManyToOne, ManyToMany, OneToOne, OneToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Challenge } from './challenge.entity';
import { User } from './user.entity';

@Entity()
export class ChallengeMember extends BaseEntity {
  @ManyToOne(() => User, (user) => user.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: Challenge;
}
