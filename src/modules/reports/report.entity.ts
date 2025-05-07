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
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  reporter: User;

  @Column({ type: 'enum', enum: TargetType })
  target_type: TargetType;

  @Column()
  target_id: number;

  @Column('text')
  reason: string;

  @Column('text', { nullable: true })
  reported_content: string;

  @ManyToOne(() => Post, (post) => post.reports, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column({ nullable: true })
  reported_user_id?: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Notice, (notice) => notice.reports, {
    cascade: true,
  })
  notice: Notice[];

  @Column({ default: false })
  handled: boolean;
}
