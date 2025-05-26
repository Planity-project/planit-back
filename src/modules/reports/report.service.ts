import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, TargetType } from './entities/report.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { User, UserStatus } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly userService: UserService,
    private readonly notificationeService: NotificationService,
  ) {}

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      where: { handled: false },
      relations: ['reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (report.target_type === TargetType.COMMENT) {
      const comment = await this.commentRepository.findOne({
        where: { id: report.target_id },
      });
      if (!comment) {
        throw new NotFoundException(
          `Comment not found for ID ${report.target_id}`,
        );
      }
    }

    if (report.target_type === TargetType.USER) {
      const user = await this.userService.findById(report.target_id);
      if (!user) {
        throw new NotFoundException(
          `User not found for ID ${report.target_id}`,
        );
      }
    }

    return report;
  }

  async create(report: Report): Promise<Report> {
    console.log('신고 생성 요청:', report);

    const existingReport = await this.reportRepository.findOne({
      where: {
        reporter: { id: report.reporter.id },
        target_id: report.target_id,
        target_type: report.target_type,
      },
    });

    if (existingReport) {
      throw new BadRequestException(
        '이미 해당 콘텐츠에 대해 신고한 이력이 있습니다.',
      );
    }

    if (report.target_type === TargetType.COMMENT) {
      const comment = await this.commentRepository.findOne({
        where: { id: report.target_id },
        relations: ['user'],
      });

      if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');

      report.reported_content = comment.content;
      report.reported_user_id = comment.user?.id;
    } else if (report.target_type === TargetType.USER) {
      const user = await this.userService.findById(report.target_id);
      if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

      report.reported_content = `${user.nickname} 유저 신고`;
      report.reported_user_id = user.id;
    } else {
      throw new BadRequestException('지원하지 않는 신고 유형입니다.');
    }

    return this.reportRepository.save(report);
  }

  async delete(id: number): Promise<boolean> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    await this.reportRepository.remove(report);
    return true;
  }

  async findReportedUser(report: Report): Promise<User | null> {
    if (report.target_type === TargetType.COMMENT) {
      const comment = await this.commentRepository.findOne({
        where: { id: report.target_id },
        relations: ['user'],
      });
      return comment?.user ?? null;
    }

    if (report.target_type === TargetType.USER) {
      return await this.userService.findById(report.target_id);
    }

    return null;
  }

  async handleReport(reportId: number): Promise<boolean> {
    console.log(`🛠️ 신고 ID: ${reportId} 처리 시작`);

    const report = await this.findOne(reportId);
    if (!report) {
      console.log(`❌ 신고 ID ${reportId}를 찾을 수 없습니다`);
      return false;
    }

    console.log(`📄 신고 데이터:`, report);

    const reportedUser = await this.findReportedUser(report);
    if (!reportedUser) {
      console.log(`❌ 신고 대상 유저를 찾을 수 없습니다`);
      return false;
    }

    console.log(
      `👤 신고 대상 유저: ${reportedUser.nickname} (ID: ${reportedUser.id})`,
    );

    reportedUser.report_count = (reportedUser.report_count || 0) + 1;
    console.log(`⚠️ 신고 횟수: ${reportedUser.report_count}`);

    // --- 신고 누적별 정지 처리 로직 ---
    const now = new Date();

    if (reportedUser.report_count >= 5) {
      // 5회 이상 신고 → 2주 정지
      reportedUser.status = UserStatus.STOP;
      reportedUser.suspend_until = new Date(
        now.getTime() + 14 * 24 * 60 * 60 * 1000,
      ); // 2주 후
      reportedUser.suspend_reason = '신고 누적 5회로 2주 정지됨';
      console.log(`🚫 유저 상태 STOP (2주 정지)`);
    } else if (reportedUser.report_count >= 3) {
      // 3회 이상 신고 → 5일 정지
      reportedUser.status = UserStatus.STOP;
      reportedUser.suspend_until = new Date(
        now.getTime() + 5 * 24 * 60 * 60 * 1000,
      ); // 5일 후
      reportedUser.suspend_reason = '신고 누적 3회로 5일 정지됨';
      console.log(`🚫 유저 상태 STOP (5일 정지)`);
    }

    await this.userService.save(reportedUser);
    console.log(`💾 유저 정보 저장 완료`);

    const message =
      reportedUser.status === UserStatus.STOP
        ? `🚨 신고가 누적되어 계정이 정지되었습니다! 기간: ${
            reportedUser.suspend_until?.toLocaleDateString() ?? '알 수 없음'
          }`
        : '⚠️ 신고가 접수되었습니다. 주의해 주세요!';

    await this.notificationeService.sendNotification({
      user: reportedUser,
      content: message,
      report,
      type: 'REPORT',
    });

    console.log(`📢 알림 전송 완료 → ${reportedUser.nickname}: ${message}`);

    await this.markHandled(report);
    console.log(`📋 신고 상태 처리됨으로 변경`);

    return true;
  }

  // 신고 3번부터 블랙리스트

  async markHandled(report: Report): Promise<void> {
    report.handled = true;
    await this.reportRepository.save(report);
  }
}
