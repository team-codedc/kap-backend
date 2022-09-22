import { CHALLENGE_CATEGORY_TYPE, CHALLENGE_CATEGORY_TYPE_VALUES } from 'src/libs/constants';
import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ChallengeMember } from './challenge-member.entity';
import { User } from './user.entity';

@Entity()
export class Challenge extends BaseEntity {
  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  rule: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column({ type: 'enum', enum: CHALLENGE_CATEGORY_TYPE_VALUES })
  category: CHALLENGE_CATEGORY_TYPE;

  @ManyToOne(() => User, (user) => user.challenges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @OneToMany(() => ChallengeMember, (members) => members.challenge)
  members: ChallengeMember[];
}
