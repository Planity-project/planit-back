import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Notice } from 'src/modules/notice/entities/notice.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  imgUrl: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.post, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Location)
  location: Location;

  @ManyToOne(() => Notice)
  notice: Notice[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];
}
