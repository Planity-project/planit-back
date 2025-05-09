import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from './album.entity';

@Entity('album_images')
export class AlbumImage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Album)
  album: Album;

  @Column({ nullable: true })
  imgsrc: string;

  @CreateDateColumn()
  createdAt: Date;
}
