//앨범 그룹

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from './albumImage.entity';
@Entity('albums')
export class Album {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => AlbumGroup)
  group: AlbumGroup;
  @Column()
  img: string;
  @Column({ type: 'text', nullable: true })
  content: string;
  @CreateDateColumn()
  createdAt: Date;
}
