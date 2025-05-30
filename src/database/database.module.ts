import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { AlbumModule } from 'src/modules/album/album.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { LikeModule } from 'src/modules/like/like.module';
import { LocationModule } from 'src/modules/location/location.module';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { TripsModule } from 'src/modules/trips/trips.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { UserModule } from 'src/modules/user/user.module';
import { MapModule } from 'src/modules/map/map.module';
import { BannerModule } from 'src/modules/admin/banner/banner.module';
import { ReportModule } from 'src/modules/reports/report.module';
import { GeminiModule } from 'src/modules/gemini/gemini.module';
import { SchedulerModule } from 'src/modules/scheduler/scheduler.module';
import { DashboardModule } from 'src/modules/admin/Dashboard/dashboard.module';
import { LoginHistoryModule } from 'src/modules/auth/loginhistory/loginhistory.module';

import { Report } from 'src/modules/reports/entities/report.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumGroup.entity';
import { AlbumImage } from 'src/modules/album/entities/albumImage';
import { User } from 'src/modules/user/entities/user.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Notification } from 'src/modules/notification/entities/notification.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { PostHashtag } from 'src/modules/posts/entities/postHashtags.entity';
import { PostImage } from 'src/modules/posts/entities/postImage.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Trip } from 'src/modules/trips/entities/trips.entity';
import { Place } from 'src/modules/trips/entities/place.entity';
import { TripDay } from 'src/modules/trips/entities/tripday.entity';
import { TripScheduleItem } from 'src/modules/trips/entities/tripscheduleitems.entity';
import { Banner } from 'src/modules/admin/banner/entities/banner.entity';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';
import { UserCumulativeLog } from 'src/modules/auth/loginhistory/entities/userCumulativeLog.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        Admin,
        Report,
        Album,
        AlbumGroup,
        AlbumImage,
        User,
        Comment,
        Like,
        Location,
        Notification,
        Payment,
        Post,
        PostHashtag,
        PostImage,
        Trip,
        Place,
        TripDay,
        TripScheduleItem,
        Banner,
        UserLoginLog,
        UserCumulativeLog,
      ],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([
      Admin,
      Report,
      Album,
      AlbumGroup,
      AlbumImage,
      User,
      Comment,
      Like,
      Location,
      Notification,
      Payment,
      Post,
      PostHashtag,
      PostImage,
      Trip,
      Report,
    ]),
    UserModule,
    AlbumModule,
    AuthModule,
    CommentModule,
    LikeModule,
    LocationModule,
    NotificationModule,
    PaymentsModule,
    PostsModule,
    TripsModule,
    MapModule,
    BannerModule,
    ReportModule,
    GeminiModule,
    SchedulerModule,
    DashboardModule,
    LoginHistoryModule,
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
