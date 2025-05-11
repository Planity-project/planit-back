import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Notice } from './entities/notice.entity';
// import { JwtAuthGuard } from "../auth/jwtauth.guard";
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('알림(Notice)')
@Controller('Notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  // ✅ 유저의 알림 목록 조회
  @Get()
  // @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '유저 알림 목록 조회',
    description: '로그인한 유저의 알림 리스트를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '알림 목록 반환' })
  async getUserNotice(@Req() req: Request) {
    const user = req.user as User;
    return this.noticeService.getUserNotice(user.id);
  }

  // ✅ 알림 읽음 처리
  @Patch(':noticeId/read')
  @ApiOperation({
    summary: '알림 읽음 처리',
    description: '특정 알림을 읽음 상태로 변경합니다.',
  })
  @ApiParam({
    name: 'noticeId',
    type: Number,
    description: '읽음 처리할 알림 ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 200, description: '읽음 처리된 알림 반환' })
  async markNoticeAsRead(
    @Param('noticeId', ParseIntPipe) noticeId: number,
    @Body('userId') userId: number,
  ): Promise<Notice> {
    return this.noticeService.markNoticeAsRead(noticeId, userId);
  }
}
