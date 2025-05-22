import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { Trip } from '../trips/entities/trips.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Trip])],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
