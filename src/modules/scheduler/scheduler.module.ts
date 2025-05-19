import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { TripsNotificationModule } from 'src/modules/tripsnotification/tripsnotification.module';

@Module({
  imports: [ScheduleModule.forRoot(), TripsNotificationModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
