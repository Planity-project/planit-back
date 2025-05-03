import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async getPosts(id: number): Promise<Post[]> {
    return await this.postRepo.find({
      where: { user: { id } },
      relations: ['user', 'location'],
    });
  }
}
