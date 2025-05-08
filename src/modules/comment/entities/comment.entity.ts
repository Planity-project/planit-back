import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Like } from 'src/modules/like/entities/like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: ['POST', 'ALBUM'] })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => Post, { nullable: true })
  post: Post;

  @ManyToOne(() => Comment, { nullable: true })
  parent: Comment;

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];
}
