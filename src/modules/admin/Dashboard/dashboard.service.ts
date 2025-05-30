import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/modules/user/entities/user.entity';
import { Repository, In } from 'typeorm';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';
import { UserCumulativeLog } from 'src/modules/auth/loginhistory/entities/userCumulativeLog.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { TargetType } from 'src/modules/reports/entities/report.entity';
import { Like } from 'src/modules/like/entities/like.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLoginLog)
    private readonly loginLogRepository: Repository<UserLoginLog>,
    @InjectRepository(UserCumulativeLog)
    private readonly userCumulativeLogRepository: Repository<UserCumulativeLog>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.loginLogRepository.count();
    const suspendedUsers = await this.userRepository.count({
      where: { status: UserStatus.STOP },
    });
    const loginCount = await this.userCumulativeLogRepository.count();

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      loginCount,
    };
  }

  // 인기 게시물
  async getPopularPosts() {
    const posts = await this.postRepository.find({
      where: { type: true },
      order: { viewCount: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    // 게시글 ID 배열 뽑기
    const postIds = posts.map((post) => post.id);

    // 각 게시글의 좋아요 수 조회 (type === 'POST')
    const likeCountsRaw = await this.likeRepository
      .createQueryBuilder('like')
      .select('like.postId', 'postId')
      .addSelect('COUNT(*)', 'count')
      .where('like.postId IN (:...postIds)', { postIds })
      .andWhere('like.type = :type', { type: 'POST' })
      .groupBy('like.postId')
      .getRawMany();

    // 결과를 Map으로 변환
    const likeCountsMap = new Map<number, number>();
    for (const row of likeCountsRaw) {
      likeCountsMap.set(Number(row.postId), Number(row.count));
    }

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.user?.nickname,
      views: post.viewCount,
      like: likeCountsMap.get(post.id) ?? 0,
    }));
  }

  async getLoginTrend(range: string) {
    const now = new Date();
    let startDate = new Date();

    if (range === '7d') {
      startDate.setDate(now.getDate() - 6); // 오늘 포함 7일
    } else if (range === '30d') {
      startDate.setDate(now.getDate() - 29);
    } else {
      startDate.setDate(now.getDate() - 6); // 기본값 7일
    }
    const rawData = await this.loginLogRepository.find();

    const raw = await this.loginLogRepository
      .createQueryBuilder('log')
      .select('DATE(log.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return raw.map((entry) => ({
      date: entry.date.toISOString().split('T')[0],
      count: parseInt(entry.count, 10),
    }));
  }

  async getReportedUsers() {
    const reportedUsers = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.target_id', 'userId')
      .addSelect('COUNT(*)', 'reportCount')
      .where('report.target_type = :type', { type: TargetType.USER })
      .andWhere('report.handled = false')
      .groupBy('report.target_id')
      .orderBy('reportCount', 'DESC')
      .limit(10)
      .getRawMany();

    // userId 목록 추출
    const userIds = reportedUsers.map((r) => r.userId);

    const users = await this.userRepository.findByIds(userIds);

    // userId별 신고 수 매핑
    const reportCountMap = new Map(
      reportedUsers.map((r) => [r.userId, parseInt(r.reportCount, 10)]),
    );

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      report_count: reportCountMap.get(user.id) || 0,
      suspend_reason: user.suspend_reason,
      suspend_until: user.suspend_until,
    }));
  }

  async getReportedComments() {
    const reportedComments = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.target_id', 'commentId')
      .addSelect('COUNT(*)', 'reportCount')
      .where('report.target_type = :type', { type: TargetType.COMMENT })
      .andWhere('report.handled = false')
      .groupBy('report.target_id')
      .orderBy('reportCount', 'DESC')
      .limit(10)
      .getRawMany();

    const commentIds = reportedComments.map((r) => r.commentId);

    const comments = await this.commentRepository.find({
      where: { id: In(commentIds) },
      relations: ['user', 'albumImage'],
    });

    const reportCountMap = new Map(
      reportedComments.map((r) => [r.commentId, parseInt(r.reportCount, 10)]),
    );

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      report_count: reportCountMap.get(comment.id) || 0,
      author: {
        id: comment.user.id,
        nickname: comment.user.nickname,
      },
      albumImageId: comment.albumImage?.id,
    }));
  }
}
