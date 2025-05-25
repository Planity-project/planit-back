import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { TripDay } from './tripday.entity';
import { Place } from './place.entity';
import { Trip } from './trips.entity';

@Entity('trip_schedule_items')
export class TripScheduleItem {
  @ApiProperty({ example: 1, description: '일정 아이템 ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '09:00:00', description: '일정 시작 시간' })
  @Column({ type: 'time' })
  startTime: string;

  @ApiProperty({ example: '10:30:00', description: '일정 종료 시간' })
  @Column({ type: 'time' })
  endTime: string;

  @ApiProperty({
    example: '경복궁 방문',
    nullable: true,
    description: '일정 제목',
  })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({
    example: '경복궁 투어와 설명',
    nullable: true,
    description: '상세 설명',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ example: 1, description: '해당 날짜 내 정렬 순서' })
  @Column({ default: 0 })
  todayOrder: number;

  @ApiProperty({ type: () => Place, nullable: true, description: '연관 장소' })
  @ManyToOne(() => Place, { nullable: true, onDelete: 'CASCADE' })
  place?: Place;

  @ApiProperty({ type: () => TripDay, description: '연관된 여행 날짜' })
  @ManyToOne(() => TripDay, (tripDay) => tripDay.scheduleItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tripdayId' })
  tripDay: TripDay;

  @ApiProperty({ type: () => Trip, description: '연관된 여행' })
  @ManyToOne(() => Trip, (trip) => trip.tripItems, { onDelete: 'CASCADE' })
  trip: Trip;
}
