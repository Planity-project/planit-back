import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, TargetType } from './entities/report.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { User, UserStatus } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UserService,
  ) {}

  async findAll(): Promise<Report[]> {
    return this.reportRepository.find({
      where: { handled: false },
      relations: ['reporter'],
      order: { created_at: 'DESC' },
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

    if (report.target_type === TargetType.POST) {
      const post = await this.postRepository.findOne({
        where: { id: report.target_id },
      });
      if (!post) {
        throw new NotFoundException(
          `Post not found for ID ${report.target_id}`,
        );
      }
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
    const existingReport = await this.reportRepository.findOne({
      where: {
        reporter: report.reporter,
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
    } else if (report.target_type === TargetType.POST) {
      const post = await this.postRepository.findOne({
        where: { id: report.target_id },
        relations: ['author', 'post'],
      });

      if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
      report.reported_content = post.content;
      report.reported_user_id = post.user?.id;
    } else if (report.target_type === TargetType.USER) {
      const user = await this.userService.findById(report.target_id);
      if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

      report.reported_content = `${user.nickname} 유저 신고`;
      report.reported_user_id = user.id;
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

    if (report.target_type === TargetType.POST) {
      const post = await this.postRepository.findOne({
        where: { id: report.target_id },
        relations: ['user'],
      });
      return post?.user ?? null;
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

    if (reportedUser.report_count >= 2) {
      reportedUser.status = UserStatus.STOP;
      console.log(`🚫 유저 상태 STOP으로 변경됨`);
    }

    await this.userService.save(reportedUser);
    console.log(`💾 유저 정보 저장 완료`);

    const message =
      reportedUser.status === UserStatus.STOP
        ? '🚨 신고가 누적되어 계정이 정지되었습니다!'
        : '⚠️ 신고가 접수되었습니다. 주의해 주세요!';

    // await this.notificationService.sendNotice({
    //   user: reportedUser,
    //   content: message,
    // });

    console.log(`📢 알림 전송 완료 → ${reportedUser.nickname}: ${message}`);

    await this.markHandled(report);
    console.log(`📋 신고 상태 처리됨으로 변경`);

    return true;
  }

  async markHandled(report: Report): Promise<void> {
    report.handled = true;
    await this.reportRepository.save(report);
  }
}
