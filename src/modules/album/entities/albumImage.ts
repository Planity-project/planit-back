import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from './album.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Like } from 'src/modules/like/entities/like.entity';
@Entity('album_images')
export class AlbumImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  likeCnt: number;

  @Column({ nullable: true })
  commentCnt: number;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Album)
  @JoinColumn({ name: 'albumId' })
  album: Album;

  @OneToMany(() => Comment, (comment) => comment.albumImage)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.albumImage)
  likes: Like[];
}
