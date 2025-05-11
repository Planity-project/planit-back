import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

import { User } from 'src/modules/user/entities/user.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { Report } from 'src/modules/reports/entities/report.entity';

import { UserModule } from 'src/modules/user/user.module';
import { NoticeModule } from 'src/modules/notice/notice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Post, Album, Report]),
    UserModule,
    NoticeModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
