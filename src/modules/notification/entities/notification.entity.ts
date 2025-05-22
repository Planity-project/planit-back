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
import { Trip } from 'src/modules/trips/entities/trips.entity';

export type NotificationType = 'POST' | 'ALBUM' | 'REPORT' | 'TRIP';
export type NotificationStatus = 'UNREAD' | 'READ';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['POST', 'ALBUM', 'REPORT', 'TRIP'],
    default: 'POST',
  })
  type: NotificationType;
  // POST : 좋아요 알림
  // ALBUM: 그룹 초대, 앨범 등록, 댓글, 대댓글, 좋아요 알림 등
  // REPORT: 신고 처리 알림
  // TRIP : 일정 평점 알림

  @Column({ type: 'enum', enum: ['UNREAD', 'READ'], default: 'UNREAD' })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  // Trip 알림용
  @Column({ type: 'timestamp', nullable: true })
  notifyAt: Date | null;

  @Column({ default: false })
  isSent: boolean;

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

  @ManyToOne(() => Trip, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  trip: Trip | null;
}
