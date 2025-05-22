import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { NotificationModule } from '../notification/notification.module';
import { TripsModule } from '../trips/trips.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule, TripsModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
