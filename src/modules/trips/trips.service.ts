import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';

import { requestGemini, generateSchedulePrompt } from 'util/generator';
@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,

    @InjectRepository(TripDay)
    private readonly tripDayRepository: Repository<TripDay>,

    @InjectRepository(TripScheduleItem)
    private readonly tripScheduleItemRepository: Repository<TripScheduleItem>,

    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  async generateWithGemini(body: any) {
    console.log(body);
    const str = generateSchedulePrompt(body);
    const data = await requestGemini(str);
    console.log(data, 'data');
    return data;
  }
}
