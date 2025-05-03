import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
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
}
