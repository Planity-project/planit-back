import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { TripDay } from './tripday.entity';
import { Place } from './place.entity';
import { TripScheduleItem } from './tripscheduleitems.entity';
import { Post } from 'src/modules/posts/entities/post.entity';

@Entity('trips')
export class Trip {
  @ApiProperty({ example: 1, description: '여행 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '부산 여행',
    nullable: true,
    description: '여행 제목',
  })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({ example: '2025-07-01', description: '여행 시작 날짜' })
  @Column({ type: 'date' })
  startDate: Date;

  @ApiProperty({ example: '2025-07-05', description: '여행 종료 날짜' })
  @Column({ type: 'date' })
  endDate: Date;

  @ApiProperty({ example: 4.5, nullable: true, description: '여행 평점' })
  @Column({ type: 'float', nullable: true })
  rating: number | null;

  @ApiProperty({
    example: '2025-06-01T12:34:56.000Z',
    description: '여행 등록일',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: () => User, description: '여행 작성자 정보' })
  @ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({ type: () => [TripDay], description: '여행의 날짜별 일정' })
  @OneToMany(() => TripDay, (day) => day.trip)
  tripDays: TripDay[];

  @ApiProperty({ type: () => [Place], description: '여행지 목록' })
  @OneToMany(() => Place, (place) => place.trip)
  place: Place[];

  @ApiProperty({
    type: () => [TripScheduleItem],
    description: '여행 일정 아이템들',
  })
  @OneToMany(() => TripScheduleItem, (items) => items.trip)
  tripItems: TripScheduleItem[];

  @ApiProperty({
    type: () => Post,
    nullable: true,
    description: '연관된 게시글',
  })
  @OneToOne(() => Post, (post) => post.trip, {
    // Trip 삭제 시 Post 삭제
    onDelete: 'CASCADE',
  })
  post: Post;
}
