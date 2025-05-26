import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserModule } from 'src/modules/user/user.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { LoginHistoryModule } from 'src/modules/auth/loginhistory/loginhistory.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Report } from 'src/modules/reports/entities/report.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';

@Module({
  imports: [
    UserModule,
    PostsModule,
    LoginHistoryModule,
    TypeOrmModule.forFeature([User, UserLoginLog, Post, Report, Comment]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
