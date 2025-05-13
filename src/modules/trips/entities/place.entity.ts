import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Location } from 'src/modules/location/entities/location.entity';
import { Trip } from './trips.entity';
import { TripDay } from './tripday.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // 예: 경복궁, 제주흑돼지 맛집

  @Column({ nullable: true })
  category: string; // 관광지, 식당, 숙소 등

  @Column({ nullable: true })
  address: string;

  @Column('float', { nullable: true })
  lat: number;

  @Column('float', { nullable: true })
  lng: number;

  @Column({ nullable: true })
  todayOrder: number;

  @Column({ nullable: true })
  image: string;

  // 📚 관계 설정
  @ManyToOne(() => Trip, (trip) => trip.place)
  trip: Trip;

  @ManyToOne(() => TripDay, (trip) => trip.place)
  tripDay: TripDay;

  @ManyToOne(() => Location, (location) => location.places)
  location: Location;
}
