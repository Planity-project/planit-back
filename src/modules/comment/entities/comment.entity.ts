import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumImage } from 'src/modules/album/entities/albumImage';
import { Like } from 'src/modules/like/entities/like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: ['ALBUM'] })
  type: 'ALBUM';

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => AlbumImage, (albumImage) => albumImage.comments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  albumImage: AlbumImage | null;

  @ManyToOne(() => Comment, { nullable: true })
  parentComments: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComments)
  childComments: Comment[];

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];
}
