import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from './entities/notice.entity';
import { SendNoticeDto } from './dto/SendNotice.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  async getUserNotice(userId: number): Promise<Notice[]> {
    return this.noticeRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async sendNotice({
    user,
    content,
    post = null,
    report = null,
    type,
  }: SendNoticeDto) {
    const notice = this.noticeRepository.create({
      user,
      content,
      post,
      report,
      type,
    });

    return await this.noticeRepository.save(notice);
  }

  async markNoticeAsRead(noticeId: number, userId: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: {
        id: noticeId,
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!notice) {
      console.log(`❌ 알림 ${noticeId} (user: ${userId}) 찾을 수 없음`);
      throw new Error('해당 유저의 알림을 찾을 수 없습니다.');
    }

    // 읽음 상태 변경
    notice.isRead = true;
    const saved = await this.noticeRepository.save(notice);

    console.log(`✅ 알림 ${noticeId} 읽음 처리 완료 (user: ${userId})`);

    return saved;
  }
}
