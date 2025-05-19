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
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumGroup.entity';

export type NotificationType = 'NORMAL' | 'ALBUM' | 'REPORT';
export type NotificationStatus = 'UNREAD' | 'READ';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['NORMAL', 'ALBUM', 'REPORT'],
    default: 'NORMAL',
  })
  type: NotificationType;
  // NORMAL: 댓글, 대댓글, 좋아요 등
  // ALBUM: 그룹 초대, 앨범 등록 알림 등
  // REPORT: 신고 처리 알림

  @Column({ type: 'enum', enum: ['UNREAD', 'READ'], default: 'UNREAD' })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.notification, { onDelete: 'CASCADE' })
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

  @ManyToOne(() => Album, (album) => album.notifications, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  album: Album | null;

  @ManyToOne(() => AlbumGroup, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  albumGroup: AlbumGroup | null;
}
