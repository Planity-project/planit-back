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
    let data = await requestGemini(str);

    try {
      // ✨ 혹시 JSON 앞뒤에 설명 텍스트가 붙어 있는 경우 제거
      const jsonStart = data.indexOf('{');
      const jsonEnd = data.lastIndexOf('}');
      const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);

      const parseData = JSON.parse(jsonSubstring);
      const dates = Object.keys(parseData);
      console.log(parseData, '전체 데이터');
      console.log(dates, '날짜', dates.length);

      //   const data = await this.tripRepository.create()
      dates.forEach((dateStr) => {
        const schedules = parseData[dateStr];

        console.log(`📅 날짜: ${dateStr}`);
        schedules.forEach((item) => {
          const {
            순서: order,
            start,
            end,
            장소: place,
            위도: lat,
            경도: lng,
            주소: address,
            타입: category,
          } = item;

          console.log(`- [${order}] ${start}~${end} / ${place} (${category})`);
          console.log(`  ↳ ${address} (${lat}, ${lng})`);
        });
      });
      return data;
    } catch (error) {
      throw new Error('유효하지 않은 JSON 형식입니다.');
    }
  }
}
