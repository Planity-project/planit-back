import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { IsString, IsOptional } from 'class-validator';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumGroup.entity';
import { Trip } from 'src/modules/trips/entities/trips.entity';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';

export enum LoginType {
  KAKAO = 'kakao',
  NAVER = 'naver',
  GOOGLE = 'google',
  TEST = 'test',
}

export enum UserStatus {
  ACTIVE = 'active',
  STOP = 'stop',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ unique: true, nullable: true })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  profile_img: string | null;

  @Column({ type: 'enum', enum: LoginType })
  type: LoginType;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ default: 0 })
  report_count: number;

  @Column({ type: 'timestamp', nullable: true })
  suspend_until?: Date;
  // 언제까지 정지되었는지

  @Column({ type: 'varchar', length: 255, nullable: true })
  suspend_reason?: string;
  // 정지된 사유 (예: 신고 누적 3회 등)

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Album, (album) => album.user)
  albums: Album[];

  @OneToMany(() => AlbumGroup, (group) => group.user)
  albumGroups: AlbumGroup[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notification: Notification[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];

  @OneToMany(() => UserLoginLog, (log) => log.user)
  loginLogs: UserLoginLog[];
}
