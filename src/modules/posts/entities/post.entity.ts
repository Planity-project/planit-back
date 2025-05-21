import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Trip } from 'src/modules/trips/entities/trips.entity';
import { PostHashtag } from './postHashtags.entity';
import { PostImage } from './postImage.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.post, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Location, { onDelete: 'SET NULL', nullable: true })
  location: Location;

  @ManyToOne(() => Notification)
  notification: Notification[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];

  @OneToOne(() => Trip, (trip) => trip.post)
  trip: Trip;

  @OneToMany(() => PostHashtag, (hashtag) => hashtag.post, { cascade: true })
  hashtags: PostHashtag[];

  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images: PostImage[];
}
