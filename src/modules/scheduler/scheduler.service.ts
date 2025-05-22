import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationService } from '../notification/notification.service';
import { TripService } from '../trips/trips.service';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly tripService: TripService,
  ) {}

  // 매일 오전 9시에 실행
  @Cron('0 9 * * *')
  async handleTripSharePrompts() {
    const currentDate = new Date();
    const endedTrips = await this.tripService.getTripsEndYesterday(currentDate);

    for (const { userId, tripId, tripTitle } of endedTrips) {
      await this.notificationService.sendShareTripNotification(
        userId,
        tripId,
        tripTitle,
      );
    }
  }
}
