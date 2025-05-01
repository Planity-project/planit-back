//신고

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
  @Column({ nullable: true })
  postId: number;
  @Column({ nullable: true })
  commentId: number;
  @Column({ nullable: true })
  groupId: number;
  @Column('text')
  content: string;
  @Column({ type: 'enum', enum: ['POST', 'COMMENT', 'ALBUM'] })
  type: string;
  @CreateDateColumn()
  createdAt: Date;
}
