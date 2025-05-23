import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  Req,
  UseGuards,
  ParseIntPipe,
  Get,
  Delete,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Report, TargetType } from './entities/report.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import { UserService } from '../user/user.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly userService: UserService,
  ) {}

  // ✅ 댓글 신고 생성
  @Post('comments/:commentId')
  @ApiOperation({ summary: '댓글 신고 생성' })
  @ApiParam({
    name: 'commentId',
    type: 'number',
    description: '신고할 댓글 ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: '신고 사유' },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({ status: 201, description: '댓글 신고 완료' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '해당 댓글을 찾을 수 없음' })
  async reportComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() reportData: { reason: string },
    @Req() req: any,
  ): Promise<Report> {
    if (!reportData.reason) {
      throw new BadRequestException('신고 사유를 입력해주세요.');
    }

    const report = new Report();
    report.reporter = req.user;
    report.target_type = TargetType.COMMENT;
    report.target_id = commentId;
    report.reason = reportData.reason;

    return this.reportService.create(report);
  }

  // ✅ 유저 신고 생성
  @Post('users/:userId')
  @ApiOperation({ summary: '유저 신고 생성' })
  @ApiParam({
    name: 'userId',
    type: 'number',
    description: '신고할 유저 ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: '신고 사유' },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({ status: 201, description: '유저 신고 완료' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '해당 유저를 찾을 수 없음' })
  async reportUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() reportData: { reason: string },
    @Req() req: any,
  ): Promise<Report> {
    console.log('req.user:', req.user);
    if (!reportData.reason || reportData.reason.trim() === '') {
      throw new BadRequestException('신고 사유를 입력해주세요.');
    }

    const targetUser = await this.userService.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    const report = new Report();
    report.reporter = req.user;
    report.target_type = TargetType.USER;
    report.target_id = userId;
    report.reason = reportData.reason;

    return this.reportService.create(report);
  }

  // ✅ 모든 신고 목록 조회 (관리자 권한 필요)
  @Get()
  @ApiOperation({ summary: '모든 신고 목록 조회 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '신고 목록 조회 성공',
    type: [Report],
  })
  async getAllReports(): Promise<Report[]> {
    return this.reportService.findAll();
  }

  // ✅ 신고 단건 조회
  @Get(':id')
  @ApiOperation({ summary: '신고 단건 조회' })
  @ApiParam({ name: 'id', type: 'number', description: '조회할 신고 ID' })
  @ApiResponse({ status: 200, description: '신고 조회 성공', type: Report })
  @ApiResponse({ status: 404, description: '해당 신고를 찾을 수 없음' })
  async getReportById(@Param('id', ParseIntPipe) id: number): Promise<Report> {
    const report = await this.reportService.findOne(id);
    if (!report) {
      throw new NotFoundException('해당 신고를 찾을 수 없습니다.');
    }
    return report;
  }

  // ✅ 신고 삭제 (관리자 권한 필요)
  @Delete(':id')
  @ApiOperation({ summary: '신고 삭제 (관리자)' })
  @ApiParam({ name: 'id', type: 'number', description: '삭제할 신고 ID' })
  @ApiResponse({ status: 200, description: '신고 삭제 성공' })
  @ApiResponse({ status: 404, description: '해당 신고를 찾을 수 없음' })
  async deleteReport(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const success = await this.reportService.delete(id);
    if (!success) {
      throw new NotFoundException('해당 신고를 찾을 수 없습니다.');
    }
    return { message: '신고가 삭제되었습니다.' };
  }

  // ✅ 신고 처리 (신고자에게 알림 + 신고 횟수 증가)
  @Patch(':id/handle')
  @ApiOperation({ summary: '신고 처리 (신고자에게 알림 + 신고 횟수 증가)' })
  @ApiParam({ name: 'id', type: 'number', description: '처리할 신고 ID' })
  @ApiResponse({ status: 200, description: '신고 처리 성공' })
  async handleReport(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const success = await this.reportService.handleReport(id);

    if (!success) {
      throw new NotFoundException('해당 신고를 처리할 수 없습니다.');
    }

    return { message: '신고가 처리되었습니다.' };
  }
}
