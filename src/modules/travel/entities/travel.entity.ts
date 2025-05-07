//여행 일정

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Location } from 'src/modules/location/entities/location.entity';
export class Travel {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Location)
  location: Location;
  @Column({ type: 'text', nullable: true })
  detail: string;
  @Column({ type: 'text', nullable: true })
  review: string;
  @Column({ nullable: true })
  oneLine: string;
  @Column({ nullable: true })
  cost: number;
  @Column({ nullable: true })
  exCost: number;
  @Column({ type: 'date', nullable: true })
  startDate: string;
  @Column({ type: 'date', nullable: true })
  endDate: string;
}
