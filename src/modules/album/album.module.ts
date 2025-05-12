import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Album, AlbumGroup, AlbumImage, User, Comment]),
  ],
  controllers: [AlbumController],
  providers: [AlbumService],
  exports: [TypeOrmModule.forFeature([AlbumGroup])],
})
export class AlbumModule {}
