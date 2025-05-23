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
  async getUserNotification(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
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
    });

    return await this.notificationRepository.save(notification);
  }

  // ✅ 알림 읽음 처리
  async markNoticeAsRead(
    noticeId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        id: noticeId,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!notification) {
      throw new Error('해당 유저의 알림을 찾을 수 없습니다.');
    }

    notification.status = 'READ';
    return await this.notificationRepository.save(notification);
  }

  // ✅ 여행 종료 후 다음날 알림 예약
  async createNotificationTrip(userId: number, tripId: number, endDate: Date) {
    const notifyAt = new Date(endDate);
    notifyAt.setDate(notifyAt.getDate() + 1);

    const exists = await this.notificationRepository.findOne({
      where: {
        user: { id: userId },
        trip: { id: tripId },
      },
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
      // TODO: 알림 전송 로직 추가
      notification.isSent = true;
      await this.notificationRepository.save(notification);
    }
  }

  // ✅ 평점 제출 후 여행 알림 제거
  async submitTripRating(userId: number, tripId: number, rating: number) {
    const trip = await this.tripRepository.findOne({
      where: {
        id: tripId,
        user: { id: userId },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

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

  // ✅ 알림 일정 보내기
  async sendShareTripNotification(
    userId: number,
    tripId: number,
    tripTitle: string,
  ) {
    const content = `여행 "${tripTitle}"을(를) 공유하시겠습니까?`;

    const notification = this.notificationRepository.create({
      user: { id: userId },
      trip: { id: tripId },
      content,
      type: 'TRIP',
      notifyAt: new Date(),
    });

    await this.notificationRepository.save(notification);
  }
  // ✅ 게시글 좋아요 시 알림 생성
  async createPostLikeNotification(sender: User, post: Post): Promise<void> {
    if (post.user.id === sender.id) return; // 자기 글이면 알림 제외

    const notification = this.notificationRepository.create({
      user: post.user, // 알림 받을 사람
      content: `${sender.nickname}님이 "${post.title}" 게시글에 좋아요를 눌렀습니다.`,
      type: 'POST',
      status: 'UNREAD',
      post: post,
      notifyAt: null,
      isSent: false,
    });

    await this.notificationRepository.save(notification);
  }

  async createNotification(
    sender: User,
    text: string,
    post?: Post,
    album?: Album,
    albumGroup?: AlbumGroup,
    albumImage?: AlbumImage,
  ): Promise<void> {
    // 1) post가 있을 때
    if (post) {
      if (post.user.id === sender.id) return; // 자기 자신 제외

      const notification = this.notificationRepository.create({
        user: post.user,
        content: text,
        type: 'POST',
        status: 'UNREAD',
        post,
        notifyAt: null,
        isSent: false,
      });

      await this.notificationRepository.save(notification);
      return;
    }

    // 2) album이 있을 때 (album에 속한 모든 사용자에게 알림)
    if (album) {
      for (const user of album.groups) {
        // album.users: 앨범에 속한 사용자 배열
        if (user.id === sender.id) continue;

        const notification = this.notificationRepository.create({
          user: user.user,
          content: text,
          type: 'ALBUM',
          status: 'UNREAD',
          album,
          notifyAt: null,
          isSent: false,
        });

        await this.notificationRepository.save(notification);
      }
      return;
    }

    // 4) albumImage가 있을 때 (작성자에게만 알림)
    if (albumImage) {
      if (albumImage.user.id === sender.id) return; // 자기 자신 제외

      const notification = this.notificationRepository.create({
        user: albumImage.user,
        content: text,
        type: 'ALBUM',
        status: 'UNREAD',
        albumImage,
        notifyAt: null,
        isSent: false,
      });

      await this.notificationRepository.save(notification);
      return;
    }
  }
}
