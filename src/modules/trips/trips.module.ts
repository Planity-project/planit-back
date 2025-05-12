import { Module } from '@nestjs/common';
import { TravelService } from './trips.service';
import { TravelController } from './trips.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Place, TripDay, TripScheduleItem, Trip])],
  controllers: [TravelController],
  providers: [TravelService],
})
export class TravelModule {}
