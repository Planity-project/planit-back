import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Trip } from './trips.entity';
import { TripScheduleItem } from './tripscheduleitems.entity';

@Entity('trip_days')
export class TripDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  order: number;

  // 📚 관계 설정

  @ManyToOne(() => Trip, (trip) => trip.tripDays)
  trip: Trip;

  @OneToMany(() => TripScheduleItem, (item) => item.tripDay)
  scheduleItems: TripScheduleItem[];
}
