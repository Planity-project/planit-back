import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsNotification } from '../tripsnotification/entities/tripsnotifications.entity';
import { TripsNotificationService } from '../tripsnotification/tripsnotification.service';
import { TripsNotificationController } from '../tripsnotification/tripsnotification.controller';
import { Trip } from '../trips/entities/trips.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TripsNotification, Trip])],
  providers: [TripsNotificationService],
  controllers: [TripsNotificationController],
  exports: [TripsNotificationService],
})
export class TripsNotificationModule {}

//////////
