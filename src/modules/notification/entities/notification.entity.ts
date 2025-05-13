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

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: ['REPORT', 'ALARM'], default: 'REPORT' })
  type: 'REPORT' | 'ALARM';
  // 내 게시물에 댓글, 내 댓글에 대댓글, 내가 쓴 게시물, 댓글 좋아요, 앨범(그룹에 유저 추가 알림)(타입으로 전체, 앨범)

  @Column({ type: 'enum', enum: ['UNREAD', 'READ'], default: 'UNREAD' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  // 📚 관계 설정

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Report, (report) => report.notification, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  report: Report | null;

  @ManyToOne(() => Post, (post) => post.notification, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  post: Post | null;
}
