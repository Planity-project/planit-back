import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly notificationService: NotificationService) {}

  // 매일 오전 9시에 실행
  @Cron('0 9 * * *')
  async handleTripNotificationCheck() {
    const now = new Date();
    console.log(
      `[Scheduler] Running trip notifications at ${now.toISOString()}`,
    );

    await this.notificationService.sendTripNotifications(now);
  }
}
