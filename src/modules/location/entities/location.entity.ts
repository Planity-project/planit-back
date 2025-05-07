import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true, default: '대한민국' })
  country: string;

  @Column({ nullable: true })
  lat: number;

  @Column({ nullable: true })
  lng: number;
}
