//좋아요

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('likes')
export class Like {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column({ nullable: true })
  postId: number;
  @Column({ nullable: true })
  commentId: number;
  @Column({ type: 'enum', enum: ['POST', 'COMMENT'] })
  type: string;
  @CreateDateColumn()
  createdAt: Date;
}
