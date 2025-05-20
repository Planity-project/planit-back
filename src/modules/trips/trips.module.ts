import { Module } from '@nestjs/common';
import { TripService } from './trips.service';
import { TripController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
import { User } from '../user/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { PostImage } from '../posts/entities/postImage.entity';
import { PostHashtag } from '../posts/entities/postHashtags.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      TripDay,
      TripScheduleItem,
      Trip,
      User,
      Post,
      PostImage,
      PostHashtag,
    ]),
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TravelModule {}
