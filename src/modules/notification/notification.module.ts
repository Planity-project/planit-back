import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { Trip } from '../trips/entities/trips.entity';
import { Album } from '../album/entities/album.entity';
import { AlbumGroup } from '../album/entities/albumGroup.entity';
import { AlbumImage } from '../album/entities/albumImage';
import { Comment } from '../comment/entities/comment.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Trip,
      Album,
      AlbumGroup,
      AlbumImage,
      Comment,
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
