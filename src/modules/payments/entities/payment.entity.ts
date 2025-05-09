import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumGroup.entity';

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
  user: User;

  @ManyToOne(() => AlbumGroup)
  group: AlbumGroup;
}
