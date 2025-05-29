import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Album } from '../album/entities/album.entity';
import { AuthModule } from '../auth/auth.module';
import { AlbumModule } from '../album/album.module';
import { AlbumService } from '../album/album.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Payment, Album]),
    AuthModule,
    AlbumModule,
    NotificationModule,
  ],

  controllers: [UserController],
  providers: [UserService, AlbumService],
  exports: [UserService],
})
export class UserModule {}
