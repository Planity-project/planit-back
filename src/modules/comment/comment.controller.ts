import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
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
    description: '앨범 이미지에 댓글 작성',
  })
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @ApiBody({ type: CreateCommentDto })
  async create(@Req() req, @Body() createCommentDto: CreateCommentDto) {
    const loginUserId = req.user.id;

    if (!createCommentDto.albumImageId) {
      throw new BadRequestException('앨범 이미지 ID는 반드시 필요합니다.');
    }

    return this.commentsService.createComment({
      ...createCommentDto,
      userId: loginUserId,
    });
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
}
