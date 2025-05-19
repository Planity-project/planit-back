import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TripsNotification } from '../tripsnotification/entities/tripsnotifications.entity';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Trip } from 'src/modules/trips/entities/trips.entity';

@Injectable()
export class TripsNotificationService {
  constructor(
    @InjectRepository(TripsNotification)
    private readonly notificationRepoitory: Repository<TripsNotification>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
  ) {}

  // 여행 종료 후 알림 생성 (종료일 + 1일)
  async createNotificationForTrip(
    userId: number,
    tripId: number,
    endDate: Date,
  ) {
    const notifyAt = new Date(endDate);
    notifyAt.setDate(notifyAt.getDate() + 1);

    const exists = await this.notificationRepoitory.findOne({
      where: {
        user: { id: userId },
        trip: { id: tripId },
      },
    });

    if (!exists) {
      const notification = this.notificationRepoitory.create({
        notifyAt,
        user: { id: userId },
        trip: { id: tripId },
      });
      await this.notificationRepoitory.save(notification);
    }
  }

  // 스케줄러용: 전송 시점 도달한 알림 처리
  async sendNotifications(currentTime: Date) {
    const notifications = await this.notificationRepoitory.find({
      where: {
        notifyAt: LessThanOrEqual(currentTime),
        isSent: false,
      },
      relations: ['user', 'trip'],
    });

    for (const notification of notifications) {
      // 여기에 실제 알림 전송 로직 삽입 가능 (이메일, 푸시 등)
      notification.isSent = true;
      await this.notificationRepoitory.save(notification);
    }
  }

  // 로그인 시: 전송된 알림 조회
  async getUserNotifications(userId: number) {
    return this.notificationRepoitory.find({
      where: {
        user: { id: userId },
        isSent: true,
      },
      relations: ['trip'],
    });
  }

  // 평점 제출
  async submitRating(userId: number, tripId: number, rating: number) {
    const trip = await this.tripRepo.findOne({
      where: {
        id: tripId,
        user: { id: userId },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    trip.rating = rating;
    await this.tripRepo.save(trip);

    await this.notificationRepoitory.delete({
      user: { id: userId },
      trip: { id: tripId },
    });
  }
}
