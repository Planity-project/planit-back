import { Controller, Post } from '@nestjs/common';
import { TripsNotificationService } from '../tripsnotification/tripsnotification.service';

@Controller('trips-notifications')
export class TripsNotificationController {
  constructor(private readonly notificationService: TripsNotificationService) {}

  @Post('send-review-reminders')
  async sendReminders() {
    await this.notificationService.sendReviewNotifications();
    return { message: '리뷰 알림 전송 완료' };
  }
}
