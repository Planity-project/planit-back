import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { TripDay } from './tripday.entity';
import { Place } from './place.entity';

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
  order: number;

  // 📚 관계 설정

  @ManyToOne(() => Place, { nullable: true })
  place?: Place;

  @ManyToOne(() => TripDay, (tripDay) => tripDay.scheduleItems)
  tripDay: TripDay;
}
