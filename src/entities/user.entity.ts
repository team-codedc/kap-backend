import { SOCIAL_TYPE, SOCIAL_TYPE_VALUES } from 'src/libs/constants';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', name: 'social_id' })
  socialId: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  nickname: string;

  @Column({ type: 'varchar', nullable: true })
  birth: string;

  @Column({ type: 'enum', enum: SOCIAL_TYPE_VALUES, name: 'social_type' })
  socialType: SOCIAL_TYPE;
}
