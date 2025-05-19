import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripsNotification } from '../tripsnotification/entities/tripsnotifications.entity';
import { Repository } from 'typeorm';
import { Trip } from '../trips/entities/trips.entity';
import { User } from '../user/entities/user.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class TripsNotificationService {
  constructor(
    @InjectRepository(TripsNotification)
    private notificationRepository: Repository<TripsNotification>,
    @InjectRepository(Trip)
    private tripRepository: Repository<Trip>,
  ) {}

  async sendReviewNotifications(): Promise<void> {
    const today = dayjs().startOf('day');
    const targetDate = today.subtract(1, 'day').toDate();

    const trips = await this.tripRepository.find({
      where: { endDate: targetDate },
      relations: ['user'],
    });

    for (const trip of trips) {
      const user = trip.user;
      const message = `‘${trip.title}’ 여행은 잘 다녀오셨나요? 리뷰를 작성해보세요!`;

      // 여기에서 푸시 알림 전송 로직 삽입
      // 예: this.pushService.send(user.id, message);

      await this.notificationRepository.save({
        user,
        trip,
        message,
        sentAt: new Date(),
      });
    }
  }
}
