import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
  ApiExtraModels,
  ApiQuery,
  ApiConsumes,
  getSchemaPath,
} from '@nestjs/swagger';

import { CreatePostDto } from './dto/create-post.dto';
import { GetMyPostDto } from './dto/getMyPost.dto';
import { GetLikePostDto } from './dto/getLikesPost.dto';
import { PostListResponseDto } from './dto/getPostList.dto';
import { PostDetailResponseDto } from './dto/getOnePosts.dto';

import { SERVER_DOMAIN } from 'util/api';
@Controller('posts')
@ApiExtraModels()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('calendar /:id')
  @ApiOperation({ summary: '내 일정 조회' })
  @ApiParam({ name: 'id', type: Number, description: '유저의 ID' })
  @ApiResponse({
    status: 200,
    type: CreatePostDto,
  })
  async getMyCalendar(@Param('id') id: number) {
    const post = await this.postsService.getPosts(id);

    if (!post) {
      return [];
    }

    return post;
  }

  @Get('detailData')
  @ApiOperation({ summary: '게시글 상세 데이터 조회' })
  @ApiQuery({ name: 'postId', type: Number, description: '조회할 게시글 ID' })
  @ApiResponse({ status: 200, description: '게시글 상세 데이터 반환' })
  getPostDetail(@Query('postId') postId: string) {
    return this.postsService.getDetail(Number(postId));
  }

  @Post('create')
  @ApiOperation({ summary: '게시글 생성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 5,
        },
        title: { type: 'string' },
        content: { type: 'string' },
        hashtags: {
          type: 'string',
          description: 'JSON.stringify 된 해시태그 문자열',
        },
        tripId: { type: 'number' },
        userId: { type: 'number' },
        rating: { type: 'number' },
      },
      required: ['title', 'content', 'hashtags', 'tripId', 'userId', 'rating'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `post-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 제한
    }),
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      title: string;
      content: string;
      hashtags: string;
      tripId: number;
      userId: number;
      rating: number;
    },
  ) {
    // hashtags는 JSON.stringify된 문자열 형태로 옴
    const { title, content, hashtags, tripId, userId, rating } = body;
    const parsedHashtags = JSON.parse(hashtags);

    // 파일 URL 생성
    const fileUrls = files.map(
      (file) => `${SERVER_DOMAIN}/uploads/posts/${file.filename}`,
    );

    // 서비스 호출해 DB 저장
    const savedPost = await this.postsService.updatePostWithDetails(
      title,
      content,
      Number(tripId),
      parsedHashtags,
      fileUrls,
      Number(userId),
      Number(rating),
    );

    return { result: true, postId: savedPost.id };
  }

  @Get('list')
  @ApiOperation({ summary: '게시글 리스트 조회 (페이징)' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: '페이지 번호 (기본 1)',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: '페이지당 게시글 수 (기본 4)',
  })
  @ApiOkResponse({
    type: PostListResponseDto,
    description: '게시글 리스트 반환',
  })
  async getPostList(@Query('page') page = 1, @Query('limit') limit = 4) {
    return await this.postsService.getAllPostsTransformed(page, limit);
  }

  @Get('detailTrip')
  @ApiOperation({ summary: '특정 게시글과 유저 정보 조회' })
  @ApiQuery({ name: 'postId', type: Number })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiOkResponse({
    type: PostDetailResponseDto,
    description: '일정 정보 반환',
  })
  async getDetailData(
    @Query('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return await this.postsService.getOnePosts(Number(postId), Number(userId));
  }

  @Get('likePosts')
  @ApiOperation({ summary: '유저가 좋아요 누른 게시글 조회' })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiOkResponse({
    type: GetLikePostDto,
    description: '좋아요 누른 일정 정보 반환',
  })
  async getLikePost(@Query('userId') userId: string) {
    return await this.postsService.likePosts(Number(userId));
  }

  @Get('myPosts')
  @ApiOperation({ summary: '유저가 작성한 게시글 조회' })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiOkResponse({
    type: GetMyPostDto,
    description: '내 일정 정보 반환',
  })
  async getMyPost(@Query('userId') userId: string) {
    return await this.postsService.myPosts(Number(userId));
  }

  @Delete('delete/post')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiQuery({ name: 'postId', type: Number })
  @ApiOkResponse({
    type: Boolean,
    description: '삭제 여부 Boolean type으로 반환',
  })
  async deletePost(@Query('postId') postId: string) {
    return await this.postsService.deletePosts(Number(postId));
  }

  @Get('like/state')
  @ApiOperation({ summary: '특정 게시글에 대한 유저 좋아요 상태 조회' })
  @ApiQuery({ name: 'postId', type: Number })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiOkResponse({
    type: Boolean,
    description: '좋아요 여부 Boolean type으로 반환',
  })
  async stateLike(
    @Query('postId') postId: string,
    @Query('userId') userId: string,
  ) {
    return await this.postsService.statePost(Number(postId), Number(userId));
  }
}
