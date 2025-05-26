import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '관리자 대시보드 통계 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 데이터 반환',
    schema: {
      example: {
        totalUsers: 1000,
        activeUsers: 100,
        suspendedUsers: 5,
        loginCount: 1234,
      },
    },
  })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('popular-posts')
  @ApiOperation({ summary: '인기 게시글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '인기 게시글 배열 반환',
    schema: {
      example: [
        {
          id: 1,
          title: '첫 게시글',
          author: '닉네임',
          views: 150,
          like: 10,
        },
      ],
    },
  })
  async getPopularPosts() {
    return this.dashboardService.getPopularPosts();
  }

  @Get('login-trend')
  @ApiOperation({ summary: '로그인 추이 조회' })
  @ApiQuery({
    name: 'range',
    description: '조회 기간, 7d 또는 30d (기본 7d)',
    required: false,
    example: '7d',
  })
  @ApiResponse({
    status: 200,
    description: '날짜별 로그인 횟수 배열 반환',
    schema: {
      example: [
        { date: '2025-05-20', count: 10 },
        { date: '2025-05-21', count: 12 },
      ],
    },
  })
  async getLoginTrend(@Query('range') range: string) {
    return this.dashboardService.getLoginTrend(range || '7d');
  }

  @Get('reported-users')
  @ApiOperation({ summary: '최근 신고된 유저 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '신고된 유저 목록 반환',
    schema: {
      example: [
        {
          id: 1,
          email: 'user@example.com',
          nickname: '신고많은유저',
          report_count: 3,
          suspend_reason: '신고 누적',
          suspend_until: '2025-06-01T00:00:00.000Z',
        },
      ],
    },
  })
  async getReportedUsers() {
    return this.dashboardService.getReportedUsers();
  }

  @Get('reported-comments')
  @ApiOperation({ summary: '최근 신고된 댓글 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '신고된 댓글 목록 반환',
    schema: {
      example: [
        {
          id: 10,
          content: '이거 너무 심해요',
          report_count: 2,
          author: {
            id: 3,
            nickname: '댓글러',
          },
          postId: 5,
        },
      ],
    },
  })
  async getReportedComments() {
    return this.dashboardService.getReportedComments();
  }
}
