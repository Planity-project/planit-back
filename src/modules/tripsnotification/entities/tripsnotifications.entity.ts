import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Trip } from 'src/modules/trips/entities/trips.entity';

@Entity('trips_notifications')
export class TripsNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  notifyAt: Date; // 알림 예정 시간

  @Column({ default: false })
  isSent: boolean; // 전송 여부

  @CreateDateColumn()
  createdAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.tripNotifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  trip: Trip;
}
