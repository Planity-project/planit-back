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

  @Cron('0 9 * * *')
  async handleTripSharePrompts() {
    console.log(`[CRON] Trip 알림 스케줄 실행됨: ${new Date().toISOString()}`);

    const currentDate = new Date();
    console.log('[CRON] 현재 날짜', currentDate.toISOString());

    let endedTrips;
    try {
      endedTrips = await this.tripService.getTripsEndYesterday(currentDate);
      console.log(
        `[CRON] 종료된 여행 조회 결과: ${endedTrips.length}건`,
        endedTrips,
      );
    } catch (error) {
      console.error('[CRON] getTripsEndYesterday 호출 중 오류:', error);
      return;
    }

    for (const { userId, tripId, tripTitle } of endedTrips) {
      console.log(
        `[CRON] 알림 전송 대상 - userId: ${userId}, tripId: ${tripId}, tripTitle: ${tripTitle}`,
      );
      try {
        await this.notificationService.sendShareTripNotification(
          userId,
          tripId,
          tripTitle,
        );
      } catch (error) {
        console.error(`[CRON] 알림 전송 실패 - tripId: ${tripId}`, error);
      }
    }
  }
}
