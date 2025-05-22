import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';

export enum TargetType {
  COMMENT = 'comment',
  USER = 'user',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TargetType })
  target_type: TargetType;

  @Column()
  target_id: number;

  @Column('text')
  reason: string;

  @Column('text', { nullable: true })
  reported_content: string;

  @Column({ nullable: true })
  reported_user_id?: number;

  @Column({ default: false })
  handled: boolean;

  @CreateDateColumn()
  created_at: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  reporter: User;

  @OneToMany(() => Notification, (notification) => notification.report, {
    cascade: true,
  })
  notification: Notification[];
}
