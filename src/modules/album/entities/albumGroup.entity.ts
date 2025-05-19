import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from './album.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';

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

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.albumGroups, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Album, (album) => album.groups)
  @JoinColumn({ name: 'albumId' })
  albums: Album;

  @OneToMany(() => Payment, (payment) => payment.albumGroup)
  payments: Payment[];

  @OneToMany(() => Notification, (notification) => notification.albumGroup)
  notifications: Notification[];
}
