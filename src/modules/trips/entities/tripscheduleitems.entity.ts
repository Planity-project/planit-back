import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { TripDay } from './tripday.entity';
import { Place } from './place.entity';

@Entity('trip_schedule_items')
export class TripScheduleItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TripDay, (tripDay) => tripDay.scheduleItems)
  tripDay: TripDay;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Place, { nullable: true })
  place?: Place;

  @Column({ default: 0 })
  order: number;
}
