import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationModule } from '../notification/notification.module';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
import { Like } from '../like/entities/like.entity';
import { Notification } from '../notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Album,
      AlbumGroup,
      AlbumImage,
      User,
      Comment,
      Like,
      Notification,
    ]),
    NotificationModule,
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [TypeOrmModule.forFeature([AlbumGroup])],
})
export class AlbumModule {}
