import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  email: string;
  @Column({ unique: true, nullable: true })
  nickname: string;
  @Column({ nullable: true })
  profile: string;
  @Column({ type: 'enum', enum: ['LOCAL', 'KAKAO', 'NAVER', 'GOOGLE'] })
  type: string;
  @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
  role: string;
  @Column({ default: 0 })
  status: number;
  @CreateDateColumn()
  createdAt: Date;
}
