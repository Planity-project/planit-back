import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
@Entity('user_logins')
export class UserLogin {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => User)
  user: User;
}
