import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

import { User } from 'src/modules/user/entities/user.entity';
import { AlbumImage } from '../album/entities/albumImage';
import { Report } from 'src/modules/reports/entities/report.entity';
import { UserModule } from 'src/modules/user/user.module';
import { NotificationModule } from 'src/modules/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, AlbumImage, Report]),
    UserModule,
    NotificationModule,
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
