import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SendNotificationDto } from './dto/SendNotification.dto';
import { Trip } from 'src/modules/trips/entities/trips.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Album } from '../album/entities/album.entity';
import { AlbumGroup } from '../album/entities/albumGroup.entity';
import { AlbumImage } from '../album/entities/albumImage';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
    @InjectRepository(AlbumGroup)
    private readonly albumGroupRepository: Repository<AlbumGroup>,
    @InjectRepository(AlbumImage)
    private readonly albumImageRepository: Repository<AlbumImage>,
  ) {}

  // ✅ 유저의 모든 알림 조회
  async getUserNotification(userId: number): Promise<any[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['post', 'album', 'report', 'trip'],
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      targetId:
        n.type === 'POST'
          ? n.post?.id
          : n.type === 'ALBUM'
            ? n.album?.id
            : n.type === 'REPORT'
              ? n.report?.id
              : n.type === 'TRIP'
                ? n.trip?.id
                : null,
      content: n.content,
      createdAt: n.createdAt,
      isRead: n.status === 'READ',
      data:
        n.type === 'POST'
          ? n.post
          : n.type === 'ALBUM'
            ? n.album
            : n.type === 'REPORT'
              ? n.report
              : n.type === 'TRIP'
                ? n.trip
                : null,
    }));
  }

  // ✅ 일반 알림 전송
  async sendNotification({
    user,
    content,
    post = null,
    report = null,
    album = null,
    albumGroup = null,
    trip = null,
    type,
  }: SendNotificationDto) {
    const notification = this.notificationRepository.create({
      user: { id: user.id },
      post: post ? { id: post.id } : null,
      report: report ? { id: report.id } : null,
      album: album ? { id: album.id } : null,
      albumGroup: albumGroup ? { id: albumGroup.id } : null,
      trip: trip ? { id: trip.id } : null,
      content,
      type,
      status: 'UNREAD',
      isSent: false,
    });

    return await this.notificationRepository.save(notification);
  }

  // ✅ 알림 읽음 처리
  async markNoticeAsRead(
    noticeId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: noticeId, user: { id: userId } },
      relations: ['user'],
    });

    if (!notification) {
      throw new Error('해당 유저의 알림을 찾을 수 없습니다.');
    }

    notification.status = 'READ';
    return await this.notificationRepository.save(notification);
  }

  async markNoticeAsReadAll(userId: number): Promise<Notification[]> {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!notifications.length) {
      return []; // 아무것도 없으면 그냥 빈 배열
    }

    for (const noti of notifications) {
      noti.status = 'READ';
    }
    return await this.notificationRepository.save(notifications);
  }

  // ✅ 여행 종료 후 다음날 알림 예약
  async createNotificationTrip(userId: number, tripId: number, endDate: Date) {
    const notifyAt = new Date(endDate);
    notifyAt.setDate(notifyAt.getDate() + 1);

    const exists = await this.notificationRepository.findOne({
      where: { user: { id: userId }, trip: { id: tripId } },
    });

    if (!exists) {
      const notification = this.notificationRepository.create({
        notifyAt,
        user: { id: userId },
        trip: { id: tripId },
        type: 'TRIP',
        content: '여행이 종료되었습니다. 평점을 남겨주세요.',
      });
      await this.notificationRepository.save(notification);
    }
  }

  // ✅ 알림 발송 시점 도달한 여행 알림 처리
  async sendTripNotifications(currentTime: Date) {
    const notifications = await this.notificationRepository.find({
      where: {
        notifyAt: LessThanOrEqual(currentTime),
        isSent: false,
        type: 'TRIP',
      },
      relations: ['user', 'trip'],
    });

    for (const notification of notifications) {
      // 실제 알림 전송 로직 필요
      notification.isSent = true;
      await this.notificationRepository.save(notification);
    }
  }

  // ✅ 평점 제출 후 여행 알림 제거
  async submitTripRating(userId: number, tripId: number, rating: number) {
    const trip = await this.tripRepository.findOne({
      where: { id: tripId, user: { id: userId } },
    });

    if (!trip) throw new NotFoundException('Trip not found');

    trip.rating = rating;
    await this.tripRepository.save(trip);

    await this.notificationRepository.delete({
      user: { id: userId },
      trip: { id: tripId },
    });
  }

  // ✅ 여행 종료일이 오늘인 사용자들에게 다음날 알림 예약
  async createNotificationsEndTrips(today: Date) {
    const trips = await this.tripRepository.find({
      where: { endDate: today },
      relations: ['user'],
    });

    for (const trip of trips) {
      await this.createNotificationTrip(trip.user.id, trip.id, trip.endDate);
    }
  }

  // ✅ 여행 공유 알림
  async sendShareTripNotification(
    userId: number,
    tripId: number,
    tripTitle: string,
  ) {
    const content = `여행 "${tripTitle}"을(를) 공유하시겠습니까?`;

    // 동일한 알림이 이미 존재하는지 확인
    const existing = await this.notificationRepository.findOne({
      where: {
        user: { id: userId },
        trip: { id: tripId },
        content,
        type: 'TRIP',
      },
    });

    if (existing) {
      console.log('[알림] 이미 존재하는 알림이므로 저장하지 않음');
      return;
    }

    const notification = this.notificationRepository.create({
      user: { id: userId },
      trip: { id: tripId },
      content,
      type: 'TRIP',
      notifyAt: new Date(),
    });

    await this.notificationRepository.save(notification);
  }

  // ✅ 게시글 좋아요 시 알림
  async createPostLikeNotification(sender: User, post: Post): Promise<void> {
    if (post.user.id === sender.id) return;

    const notification = this.notificationRepository.create({
      user: post.user,
      content: `${sender.nickname}님이 "${post.title}" 게시글에 좋아요를 눌렀습니다.`,
      type: 'POST',
      status: 'UNREAD',
      post,
      notifyAt: null,
      isSent: false,
    });

    await this.notificationRepository.save(notification);
  }

  // ✅ 다양한 상황에서 알림 생성
  async createNotification(
    sender: User,
    text: string,
    type: string,
    targetId: number,
    obj: object,
  ): Promise<void> {
    console.log(sender, text, type, targetId, obj, '알림');
    const user = await this.userRepository.findOne({ where: { id: targetId } });
    if (!user) {
      console.error('유저 정보 찾을 수 없음(알림 데이터 생성 실패)');
      return;
    }
    if (type === 'ALBUM') {
      const notification = this.notificationRepository.create({
        type: type,
        content: text,
        user: user,
        status: 'UNREAD',
        album: obj,
        notifyAt: null,
        isSent: false,
      });
      await this.notificationRepository.save(notification);
      return;
    }

    if (type === 'POST') {
      const notification = this.notificationRepository.create({
        type: type,
        content: text,
        user: user,
        status: 'UNREAD',
        post: obj,
        notifyAt: null,
        isSent: false,
      });

      await this.notificationRepository.save(notification);

      return;
    }
  }
}
