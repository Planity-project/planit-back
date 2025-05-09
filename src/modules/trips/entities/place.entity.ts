import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Location } from 'src/modules/location/entities/location.entity';

@Entity('places')
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // 예: 경복궁, 제주흑돼지 맛집

  @ManyToOne(() => Location, (location) => location.places)
  location: Location;

  @Column({ nullable: true })
  category: string; // 관광지, 식당, 숙소 등

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  lat: number;

  @Column({ nullable: true })
  lng: number;
}
