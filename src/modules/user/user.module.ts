import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Album } from '../album/entities/album.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Payment, Album])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
