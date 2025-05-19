import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TripsNotificationService } from 'src/modules/tripsnotification/tripsnotification.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly tripsNotificationService: TripsNotificationService,
  ) {}

  // 매일 오전 9시에 실행
  @Cron('0 9 * * *')
  async handleTripNotificationCheck() {
    const now = new Date();
    console.log(
      `[Scheduler] Running trip notifications at ${now.toISOString()}`,
    );

    await this.tripsNotificationService.sendNotifications(now);
  }
}
