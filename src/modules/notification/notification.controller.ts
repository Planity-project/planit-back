import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('알림(Notifications)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ✅ 유저의 알림 목록 조회
  @Get()
  @ApiOperation({
    summary: '유저 알림 조회',
    description: '로그인한 유저의 알림을 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '알림 목록 반환' })
  async getUserNotifications(@Req() req: Request) {
    const user = req.user as User;
    return this.notificationService.getUserNotification(user.id);
  }

  // ✅ 알림 읽음 처리
  @Patch(':notificationId/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiParam({ name: 'notificationId', type: Number, description: '알림 ID' })
  @ApiResponse({ status: 200, description: '읽음 처리된 알림 반환' })
  async markAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.notificationService.markNoticeAsRead(notificationId, user.id);
  }

  // ✅ 여행 종료 후 알림 예약 (개발자용 또는 테스트용으로 호출)
  @Post('trip/reminder')
  @ApiOperation({
    summary: '여행 종료 알림 예약',
    description: '여행 종료 후 다음날 평점 요청 알림을 예약합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tripId', 'endDate'],
      properties: {
        tripId: { type: 'number', example: 1 },
        endDate: { type: 'string', format: 'date', example: '2025-05-21' },
      },
    },
  })
  async createTripNotification(
    @Req() req: Request,
    @Body() body: { tripId: number; endDate: string },
  ) {
    const user = req.user as User;
    const { tripId, endDate } = body;
    const end = new Date(endDate);
    return this.notificationService.createNotificationTrip(
      user.id,
      tripId,
      end,
    );
  }

  // ✅ 특정 시간까지 도달한 여행 알림 전송 처리 (CRON 작업 등에서 호출)
  @Post('trip/send')
  @ApiOperation({
    summary: '여행 알림 전송 처리',
    description: '알림 예약 시간이 지난 여행 알림을 전송 처리합니다.',
  })
  @ApiQuery({
    name: 'time',
    required: false,
    description: '기준 시간 (기본값: 현재 시간)',
    example: '2025-05-22T00:00:00.000Z',
  })
  async sendTripNotifications(@Query('time') time?: string) {
    const targetTime = time ? new Date(time) : new Date();
    return this.notificationService.sendTripNotifications(targetTime);
  }

  // ✅ 평점 제출 및 여행 알림 제거
  @Post('trip/rating')
  @ApiOperation({
    summary: '여행 평점 제출',
    description: '여행 평점을 제출하고 관련 알림을 제거합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tripId', 'rating'],
      properties: {
        tripId: { type: 'number', example: 1 },
        rating: { type: 'number', example: 4.5 },
      },
    },
  })
  async submitTripRating(
    @Req() req: Request,
    @Body() body: { tripId: number; rating: number },
  ) {
    const user = req.user as User;
    const { tripId, rating } = body;
    return this.notificationService.submitTripRating(user.id, tripId, rating);
  }
}
