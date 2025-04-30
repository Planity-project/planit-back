import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('suspensions')
export class Suspension {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column('text')
  reason: string;
  @Column()
  durationDays: number;
  @CreateDateColumn()
  suspendedAt: Date;
}
