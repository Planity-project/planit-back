import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column({ type: 'enum', enum: ['CARD', 'BANK', 'PHONE'] })
  method: string;

  @CreateDateColumn()
  paidAt: Date;

  // 📚 관계 설정

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Album)
  @JoinColumn({ name: 'albumId' })
  album: Album;
}
