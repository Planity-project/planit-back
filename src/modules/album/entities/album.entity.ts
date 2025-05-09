//앨범 그룹

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from './albumGroup.entity';
import { AlbumImage } from './albumImage';

@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  titleImg: string;

  @Column({ type: 'text', nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => AlbumGroup)
  group: AlbumGroup;

  @ManyToOne(() => AlbumImage)
  image: AlbumImage;
}
