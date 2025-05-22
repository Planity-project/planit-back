import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Trip } from './trips.entity';
import { TripScheduleItem } from './tripscheduleitems.entity';
import { Place } from './place.entity';

@Entity('trip_days')
export class TripDay {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2025-06-10', description: '해당 날짜 (YYYY-MM-DD)' })
  @Column()
  date: string;

  @ApiProperty({
    example: 2,
    description: '여행 시작일 기준 오늘이 며칠째인지 (1일부터 시작)',
  })
  @Column()
  todayOrder: number;

  // 📚 관계 설정

  @ApiProperty({ type: () => Trip })
  @ManyToOne(() => Trip, (trip) => trip.tripDays, { onDelete: 'CASCADE' })
  trip: Trip;

  @ApiProperty({
    type: () => [TripScheduleItem],
    description: '해당 날짜의 일정 항목들',
  })
  @OneToMany(() => TripScheduleItem, (item) => item.tripDay)
  scheduleItems: TripScheduleItem[];

  @ApiProperty({ type: () => [Place], description: '해당 날짜의 장소 목록' })
  @OneToMany(() => Place, (item) => item.tripDay)
  place: Place[];
}
