import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Notice } from 'src/modules/notice/entities/notice.entity';
import { UserModule } from 'src/modules/user/user.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { NoticeModule } from 'src/modules/notice/notice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Comment, Post, User, Notice]),
    UserModule,
    CommentModule,
    PostsModule,
    NoticeModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
