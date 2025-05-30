import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from './entities/post.entity';
import { PostHashtag } from './entities/postHashtags.entity';
import { PostImage } from './entities/postImage.entity';
import { Trip } from '../trips/entities/trips.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity';
import { Like } from '../like/entities/like.entity';
import { Notification } from '../notification/entities/notification.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostHashtag,
      PostImage,
      Trip,
      User,
      Location,
      Like,
      Notification,
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
