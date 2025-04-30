import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Location } from 'src/modules/location/entities/location.entity';
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Location)
  location: Location;
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
}
