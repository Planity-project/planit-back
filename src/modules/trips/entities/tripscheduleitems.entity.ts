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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  todayOrder: number;

  // 📚 관계 설정

  @ManyToOne(() => Place, { nullable: true })
  place?: Place;

  @ManyToOne(() => TripDay, (tripDay) => tripDay.scheduleItems)
  @JoinColumn({ name: 'tripdayId' })
  tripDay: TripDay;

  @ManyToOne(() => Trip, (trip) => trip.tripItems)
  trip: Trip;
}
