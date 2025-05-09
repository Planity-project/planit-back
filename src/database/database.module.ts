import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

import { AdminModule } from 'src/modules/admin/admin.module';
import { AlbumModule } from 'src/modules/album/album.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { LikeModule } from 'src/modules/like/like.module';
import { LocationModule } from 'src/modules/location/location.module';
import { NoticeModule } from 'src/modules/notice/notice.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { TravelModule } from 'src/modules/trips/trips.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { UserModule } from 'src/modules/user/user.module';
import { MapModule } from 'src/modules/map/map.module';
import { BannerModule } from 'src/modules/admin/banner/banner.module';

import { Report } from 'src/modules/reports/entities/report.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumGroup.entity';
import { AlbumImage } from 'src/modules/album/entities/albumImage';
import { UserLogin } from 'src/modules/auth/entities/auth.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Notice } from 'src/modules/notice/entities/notice.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Trip } from 'src/modules/trips/entities/trips.entity';
import { Place } from 'src/modules/trips/entities/place.entity';
import { TripDay } from 'src/modules/trips/entities/tripday.entity';
import { TripScheduleItem } from 'src/modules/trips/entities/tripscheduleitems.entity';
import { Banner } from 'src/modules/admin/banner/entities/banner.entity';
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
        UserLogin,
        User,
        Comment,
        Like,
        Location,
        Notice,
        Payment,
        Post,
        Notice,
        Trip,
        Place,
        TripDay,
        TripScheduleItem,
        Banner,
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
      UserLogin,
      User,
      Comment,
      Like,
      Location,
      Notice,
      Payment,
      Post,
      Trip,
    ]),
    AdminModule,
    AlbumModule,
    AuthModule,
    CommentModule,
    LikeModule,
    LocationModule,
    NoticeModule,
    PaymentsModule,
    PostsModule,
    TravelModule,
    UserModule,
    MapModule,
    BannerModule,
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
