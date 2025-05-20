import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import { ReportCommentDto } from './dto/report-comment';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentsService: CommentService) {}

  // ✅ 댓글 생성
  @Post()
  @ApiOperation({
    summary: '댓글 생성',
    description: '게시글/앨범에 댓글 또는 대댓글을 작성합니다.',
  })
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @ApiBody({ type: CreateCommentDto })
  async create(@Req() req, @Body() createCommentDto: CreateCommentDto) {
    if (!createCommentDto.parentId && !createCommentDto.postId) {
      throw new Error('게시글 ID 또는 앨범 ID는 하나는 필요합니다.');
    }

    const loginUserId = req.user.id;
    return this.commentsService.createComment({
      ...createCommentDto,
      userId: loginUserId,
    });
  }

  // ✅ 게시글 댓글 조회
  @Get('/post/:postId')
  @ApiOperation({
    summary: '게시글 댓글 조회 (좋아요 여부 포함)',
    description:
      '게시글 ID 기준으로 게시글 댓글을 조회합니다. 로그인한 유저가 좋아요 누른 댓글은 isLiked=true로 표시됩니다.',
  })
  @ApiParam({ name: 'postId', type: Number, description: '게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 댓글 목록 반환 성공' })
  async getPostComments(@Req() req, @Param('postId') postId: number) {
    const loginUserId = req.user.id;
    return this.commentsService.getComments(postId, loginUserId);
  }

  // ✅ 댓글 삭제
  @Delete(':id')
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글 ID를 통해 해당 댓글을 삭제합니다.',
  })
  @ApiParam({ name: 'id', type: Number, description: '댓글 ID' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  async deleteComment(@Req() req, @Param('id') id: number) {
    const loginUserId = req.user.id;
    return this.commentsService.deleteComment(id, loginUserId);
  }

  // ✅ 댓글 신고
  @Post('/declare/:id')
  @ApiOperation({
    summary: '댓글 신고',
    description: '댓글 ID와 신고 사유를 제출하여 해당 댓글을 신고합니다.',
  })
  @ApiParam({ name: 'id', type: Number, description: '댓글 ID' })
  @ApiResponse({ status: 201, description: '댓글 신고 접수 완료' })
  @ApiBody({ type: ReportCommentDto })
  async reportComment(
    @Req() req,
    @Param('id') commentId: number,
    @Body() dto: ReportCommentDto,
  ) {
    const loginUserId = req.user.id;
    return this.commentsService.reportComment(
      commentId,
      loginUserId,
      dto.reason,
    );
  }
}
