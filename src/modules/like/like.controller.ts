import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Like (좋아요 / 찜)')
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  // ✅ 게시글 좋아요 토글
  @Post('post')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '일정 게시글 좋아요 토글 (추가/취소)' })
  async togglePostLike(
    @Req() req,
    @Query('postId', ParseIntPipe) postId: number,
  ): Promise<{ liked: boolean }> {
    console.log(req.user.id, postId, 'Controller');
    return this.likeService.togglePostLike(req.user.id, postId);
  }

  // ✅ 댓글 좋아요 토글
  @Post('comment/:commentId/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요 토글 (추가/취소)' })
  async toggleCommentLike(
    @Req() req,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<{ liked: boolean }> {
    console.log(req.user.id, commentId, 'commentToggle');
    return this.likeService.toggleCommentLike(req.user.id, commentId);
  }

  // ✅ 내가 찜한 일정 목록 조회
  @Get('my-likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내가 찜한 게시글 목록 조회' })
  async getMyLikes(@Req() req) {
    return this.likeService.findLikedPosts(req.user.id);
  }

  // ✅ 게시글 좋아요 수 조회
  @Get('post/:postId/count')
  @ApiOperation({ summary: '게시글 좋아요 수 조회' })
  async countPostLikes(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<number> {
    return this.likeService.countPostLikes(postId);
  }

  // ✅ 댓글 좋아요 수 조회
  @Get('comment/:commentId/count')
  @ApiOperation({ summary: '댓글 좋아요 수 조회' })
  async countCommentLikes(
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<number> {
    return this.likeService.countCommentLikes(commentId);
  }
}
