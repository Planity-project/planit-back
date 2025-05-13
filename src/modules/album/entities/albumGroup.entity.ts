import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from './album.entity';
@Entity('album_groups')
export class AlbumGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['FREE', 'PAID'], default: 'FREE' })
  type: string;

  @Column({ default: 0 })
  reportCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 1 })
  memberCount: number;

  @Column({
    type: 'enum',
    enum: ['OWNER', 'MEMBER'],
    default: 'OWNER',
  })
  role: string;

  // 📚 관계 설정
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Album, (album) => album.groups)
  @JoinColumn({ name: 'albumId' })
  albums: Album;
}
