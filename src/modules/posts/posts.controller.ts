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
  HttpStatus,
  HttpException,
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
} from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
@Controller('posts')
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
  getPostDetail(@Query('postId') postId: string) {
    return this.postsService.getDetail(Number(postId));
  }

  //포스트 생성
  @Post('create')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/posts', // 저장할 경로 지정
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `post-${uniqueSuffix}${ext}`; // 파일명 설정
          callback(null, filename);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 제한
    }),
  ) // 최대 5개 파일 받음, 'files'는 formData 키 이름
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: { title: string; content: string; hashtags: string; tripId: string },
  ) {
    // hashtags는 JSON.stringify된 문자열 형태로 옴
    const { title, content, hashtags, tripId } = body;
    const parsedHashtags = JSON.parse(hashtags);

    console.log('title:', title);
    console.log('content:', content);
    console.log('hashtags:', parsedHashtags);
    console.log('tripId:', tripId);
    console.log('files:', files);

    // 여기에 DB 저장

    return { result: true };
  }
}
