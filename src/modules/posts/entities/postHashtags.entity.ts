import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_hashtags')
export class PostHashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  hashtag: string;

  @ManyToOne(() => Post, (post) => post.hashtags, { onDelete: 'CASCADE' })
  post: Post;
}
