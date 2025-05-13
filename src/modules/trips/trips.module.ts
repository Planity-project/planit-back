import { Module } from '@nestjs/common';
import { TripService } from './trips.service';
import { TripController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Place, TripDay, TripScheduleItem, Trip])],
  controllers: [TripController],
  providers: [TripService],
})
export class TravelModule {}
