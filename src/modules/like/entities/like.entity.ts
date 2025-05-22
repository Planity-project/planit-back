import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { AlbumImage } from 'src/modules/album/entities/albumImage';

@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['POST', 'COMMENT'] })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  post: Post | null;

  @ManyToOne(() => Comment, (comment) => comment.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  comment: Comment | null;

  @ManyToOne(() => AlbumImage, (albumImage) => albumImage.likes, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  albumImage: AlbumImage | null;
}
