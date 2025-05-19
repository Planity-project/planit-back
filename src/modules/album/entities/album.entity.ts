import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from './albumGroup.entity';
import { AlbumImage } from './albumImage';
import { Notification } from 'src/modules/notification/entities/notification.entity';

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

  @Column({ nullable: true })
  inviteLink: string;

  @Column({ type: 'enum', enum: ['FREE', 'PAID'], default: 'FREE' })
  type: string;

  // 📚 관계 설정

  @ManyToOne(() => User, (user) => user.albums, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => AlbumGroup, (group) => group.albums)
  groups: AlbumGroup[];

  @OneToMany(() => AlbumImage, (image) => image.album)
  images: AlbumImage[];

  @OneToMany(() => Notification, (notification) => notification.album)
  notifications: Notification[];
}
