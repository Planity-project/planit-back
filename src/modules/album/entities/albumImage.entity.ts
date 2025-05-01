//앨범 이미지

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('album_groups')
export class AlbumGroup {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column({ type: 'enum', enum: ['OWNER', 'MEMBER'], default: 'OWNER' })
  role: string;
  @Column({ type: 'float', default: 0 })
  avg: number;
  @Column({ type: 'enum', enum: ['FREE', 'PAID'], default: 'FREE' })
  type: string;
  @Column({ default: 0 })
  reportCount: number;
  @CreateDateColumn()
  createdAt: Date;
}
