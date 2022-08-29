import {
  CHALLENGE_CATEGORY_TYPE,
  CHALLENGE_CATEGORY_TYPE_VALUES,
  CHALLENGE_FREQUENCY_TYPE,
  CHALLENGE_FREQUENCY_TYPE_VALUES,
} from 'src/libs/constants';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Challenge extends BaseEntity {
  @Column({ type: 'varchar', name: 'good_example_image_url' })
  goodExampleImageUrl: string;

  @Column({ type: 'varchar', name: 'bad_example_image_url' })
  badExampleImageUrl: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  rule: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: CHALLENGE_FREQUENCY_TYPE_VALUES, name: 'certification_frequency' })
  certificationFrequency: CHALLENGE_FREQUENCY_TYPE;

  @Column({ type: 'varchar', name: 'certification_per_day' })
  certificationPerDay: string;

  @Column({ type: 'varchar', name: 'certificable_start_time' })
  certificableStartTime: Date;

  @Column({ type: 'varchar', name: 'certificable_finish_time' })
  certificableFinishTime: Date;

  @Column({ type: 'varchar', name: 'start_date' })
  startDate: string;

  @Column({ type: 'varchar', name: 'finish_date' })
  finishDate: string;

  @Column({ type: 'enum', enum: CHALLENGE_CATEGORY_TYPE_VALUES })
  category: CHALLENGE_CATEGORY_TYPE;

  @ManyToOne(() => User, (user) => user.challenge, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
