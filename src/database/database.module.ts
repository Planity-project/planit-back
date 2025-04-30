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
import { TravelModule } from 'src/modules/travel/travel.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { UserModule } from 'src/modules/user/user.module';

import { Report } from 'src/modules/admin/report/entities/report.entity';
import { Suspension } from 'src/modules/admin/report/entities/suspensions';
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from 'src/modules/album/entities/albumImage.entity';
import { UserLogin } from 'src/modules/auth/entities/auth.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Like } from 'src/modules/like/entities/like.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import { Notification } from 'src/modules/notice/entities/notice.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { Post } from 'src/modules/posts/entities/post.entity';
import { TripSchedule } from 'src/modules/travel/entities/travel.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        Report,
        Suspension,
        Album,
        AlbumGroup,
        UserLogin,
        User,
        Comment,
        Like,
        Location,
        Notification,
        Payment,
        Post,
        TripSchedule,
      ],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([
      Report,
      Suspension,
      Album,
      AlbumGroup,
      UserLogin,
      User,
      Comment,
      Like,
      Location,
      Notification,
      Payment,
      Post,
      TripSchedule,
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
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
