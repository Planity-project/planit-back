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
import { AlbumGroup } from './albumGroup.entity';
import { AlbumImage } from './albumImage';
import { Comment } from 'src/modules/comment/entities/comment.entity';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  titleImg: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  likeCnt: number;

  @Column({ nullable: true })
  commentCnt: number;

  @Column({ nullable: true })
  inviteLink: string;

  // 📚 관계 설정

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => AlbumGroup, (group) => group.albums)
  groups: AlbumGroup[];

  @OneToMany(() => AlbumImage, (image) => image.album)
  images: AlbumImage[];

  @OneToMany(() => Comment, (comment) => comment.album)
  comment: Comment[];
}
