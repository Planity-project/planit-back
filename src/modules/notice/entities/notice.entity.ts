//알림

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column('text')
  content: string;
  @Column({
    type: 'enum',
    enum: ['SUSPENSION_NOTICE', 'TRIP_COMPLETE', 'GENERAL'],
    default: 'GENERAL',
  })
  type: string;
  @Column({ type: 'enum', enum: ['UNREAD', 'READ'], default: 'UNREAD' })
  status: string;
  @CreateDateColumn()
  createdAt: Date;
}
