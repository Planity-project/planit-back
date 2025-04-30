import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { TravelModule } from './travel/travel.module';
import { PostsModule } from './posts/posts.module';
import { CommentModule } from './comment/comment.module';
import { AlbumModule } from './album/album.module';
import { LikeModule } from './like/like.module';
import { ReportModule } from './report/report.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { NoticeModule } from './notice/notice.module';
@Module({
  imports: [DatabaseModule, UserModule, AuthModule, LocationModule, TravelModule, PostsModule, CommentModule, AlbumModule, LikeModule, ReportModule, PaymentsModule, AdminModule, NoticeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
