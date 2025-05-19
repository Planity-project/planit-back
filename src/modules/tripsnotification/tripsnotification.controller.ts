import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { TripsNotificationService } from '../tripsnotification/tripsnotification.service';
import { Request } from 'express';

@Controller('trips-notification')
export class TripsNotificationController {
  constructor(
    private readonly tripsNotificationService: TripsNotificationService,
  ) {}

  // 로그인한 유저의 전송된 알림 조회
  @Get('/me/notification')
  async getUserNotifications(@Req() req: Request) {
    const user = req.user as any;
    const notifications =
      await this.tripsNotificationService.getUserNotifications(user.id);

    return notifications.map((n) => ({
      tripId: n.trip.id,
      tripTitle: n.trip.title,
      notifyAt: n.notifyAt,
    }));
  }

  // 여행 평점 제출
  @Post('/trips/:id/rating')
  async submitRating(
    @Param('id') tripId: number,
    @Body('rating') rating: number,
    @Req() req: Request,
  ) {
    const user = req.user as any;

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    await this.tripsNotificationService.submitRating(user.id, tripId, rating);

    return { message: 'Rating submitted successfully' };
  }
}
