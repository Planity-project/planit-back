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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  todayOrder: number;

  // 📚 관계 설정

  @ManyToOne(() => Trip, (trip) => trip.tripDays)
  trip: Trip;

  @OneToMany(() => TripScheduleItem, (item) => item.tripDay)
  scheduleItems: TripScheduleItem[];

  @OneToMany(() => Place, (item) => item.tripDay)
  place: Place[];
}
