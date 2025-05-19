import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { TripDay } from './tripday.entity';
import { Place } from './place.entity';
import { TripScheduleItem } from './tripscheduleitems.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'float', nullable: true })
  rating: number | null; // 평점

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => TripDay, (day) => day.trip)
  tripDays: TripDay[];

  @OneToMany(() => Place, (place) => place.trip)
  place: Place[];

  @OneToMany(() => TripScheduleItem, (items) => items.trip)
  tripItems: TripScheduleItem[];

  @OneToOne(() => Post, (post) => post.trip)
  @JoinColumn()
  post: Post;
}
