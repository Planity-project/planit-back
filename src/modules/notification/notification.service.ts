import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { SendNotificationDto } from './dto/SendNotification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getUserNotification(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async sendNotification({
    user,
    content,
    post = null,
    report = null,
    type,
  }: SendNotificationDto) {
    const notification = this.notificationRepository.create({
      user,
      content,
      post,
      report,
      type,
    });

    return await this.notificationRepository.save(notification);
  }

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
      console.log(`❌ 알림 ${noticeId} (user: ${userId}) 찾을 수 없음`);
      throw new Error('해당 유저의 알림을 찾을 수 없습니다.');
    }

    // 읽음 상태 변경
    notification.isRead = true;
    const saved = await this.notificationRepository.save(notification);

    console.log(`✅ 알림 ${noticeId} 읽음 처리 완료 (user: ${userId})`);

    return saved;
  }
}
