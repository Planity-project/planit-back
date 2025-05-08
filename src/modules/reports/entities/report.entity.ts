import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Notice } from 'src/modules/notice/entities/notice.entity';
import { Post } from 'src/modules/posts/entities/post.entity';

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user',
}

// 신고 처리(게시글, 댓글, 유저)가 되면 유저에게 공지 알림이 감
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

  @OneToMany(() => Notice, (notice) => notice.report, {
    cascade: true,
  })
  notice: Notice[];

  @ManyToOne(() => Post, (post) => post.reports, {
    onDelete: 'CASCADE',
  })
  post: Post;
}
