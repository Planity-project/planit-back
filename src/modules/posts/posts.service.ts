import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async getPosts(id: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id } },
      relations: ['user', 'location'],
    });
  }

  async getDetail(
    postId: number,
  ): Promise<
    { result: boolean; post: Post } | { result: boolean; message: string }
  > {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: [
        'user',
        'location',
        'notification',
        'likes',
        'comments',
        'reports',
        'trip',
        'trip.tripDays',
        'trip.tripDays.scheduleItems',
        'trip.tripDays.place',
      ],
    });
    return post
      ? { result: true, post }
      : { result: false, message: '유효하지 않은 아이디입니다.' };
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['user', 'trip', 'location'],
      order: { createdAt: 'DESC' }, // 최신순 정렬 (원하신다면)
    });
  }
}
