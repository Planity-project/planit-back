import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumImage.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => AlbumGroup)
  group: AlbumGroup;
  @ManyToOne(() => User)
  user: User;
  @Column()
  price: number;
  @Column({ type: 'enum', enum: ['CARD', 'BANK', 'PHONE'] })
  method: string;
  @CreateDateColumn()
  paidAt: Date;
}
