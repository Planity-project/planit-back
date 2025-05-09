import { Module } from '@nestjs/common';
import { TravelService } from './trips.service';
import { TravelController } from './trips.controller';

@Module({
  controllers: [TravelController],
  providers: [TravelService],
})
export class TravelModule {}
