import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';
import { UserModule } from '../user/user.module';
import { PostsModule } from '../posts/posts.module';
import { CommentModule } from '../comment/comment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User]),
    UserModule,
    PostsModule,
    CommentModule,
    NotificationModule,
  ],

  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
