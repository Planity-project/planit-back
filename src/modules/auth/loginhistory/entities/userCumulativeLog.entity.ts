import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class UserCumulativeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  userId: number;
}
