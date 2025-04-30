import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Post, { nullable: true })
  post: Post;
  @ManyToOne(() => User)
  user: User;
  @Column('text')
  content: string;
  @ManyToOne(() => Comment, { nullable: true })
  parent: Comment;
  @Column({ type: 'enum', enum: ['POST', 'ALBUM'] })
  type: string;
  @CreateDateColumn()
  createdAt: Date;
}
