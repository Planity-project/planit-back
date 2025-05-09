import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Place } from 'src/modules/trips/entities/place.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // 예: 서울, 제주도, 부산

  @Column({ nullable: true, default: '대한민국' })
  country: string;

  @Column({ nullable: true })
  lat: number;

  @Column({ nullable: true })
  lng: number;

  // 📚 관계 설정

  @OneToMany(() => Place, (place) => place.location)
  places: Place[];
}
