import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Location } from 'src/modules/location/entities/location.entity';
import { Trip } from './trips.entity';
import { TripDay } from './tripday.entity';

@Entity('places')
export class Place {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '경복궁', description: '장소 이름' })
  @Column()
  name: string;

  @ApiProperty({
    example: '관광지',
    description: '카테고리 (명소, 식당, 숙소 등)',
  })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ example: '서울 종로구 사직로 161', nullable: true })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ example: 37.5796, nullable: true })
  @Column('float', { nullable: true })
  lat: number;

  @ApiProperty({ example: 126.977, nullable: true })
  @Column('float', { nullable: true })
  lng: number;

  @ApiProperty({ example: 1, nullable: true, description: '일일 순서' })
  @Column({ nullable: true })
  todayOrder: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', nullable: true })
  @Column({ type: 'longtext', nullable: true })
  image: string;

  @ApiProperty({ example: 4.5, nullable: true })
  @Column({ type: 'longtext', nullable: true })
  rating: number;

  @ApiProperty({ example: 123, nullable: true })
  @Column({ type: 'longtext', nullable: true })
  reviewCount: number;

  // 📚 관계 설정

  @ApiProperty({ type: () => Trip })
  @ManyToOne(() => Trip, (trip) => trip.place, { onDelete: 'CASCADE' })
  trip: Trip;

  @ApiProperty({ type: () => TripDay })
  @ManyToOne(() => TripDay, (tripDay) => tripDay.place, { onDelete: 'CASCADE' })
  tripDay: TripDay;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location, (location) => location.places)
  location: Location;
}
