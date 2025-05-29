import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Album } from '../album/entities/album.entity';

import { UserModule } from '../user/user.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      Comment,
      Post,
      User,
      Notification,
      Album,
      Payment,
    ]),
    JwtModule,
    UserModule,
    CommentModule,
    PostsModule,
    NotificationModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
