import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Post } from 'src/modules/posts/entities/post.entity';

@Entity('notice')
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['SUSPENSION_NOTICE', 'TRIP_COMPLETE'],
  })
  type: string;

  @Column({ type: 'enum', enum: ['UNREAD', 'READ'], default: 'UNREAD' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Report, (report) => report.notice, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  report: Report | null;

  @ManyToOne(() => Post, (post) => post.notice, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  post: Post | null;
}
