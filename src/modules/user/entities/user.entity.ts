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
import { Notice } from 'src/modules/notice/entities/notice.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Album } from 'src/modules/album/entities/album.entity';

export enum LoginType {
  KAKAO = 'kakao',
  NAVER = 'naver',
  GOOGLE = 'google',
}

export enum UserStatus {
  ACTIVE = 'active',
  STOP = 'stop',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Album, (album) => album.user)
  albums: Album[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => Notice, (notice) => notice.user)
  notice: Notice[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
