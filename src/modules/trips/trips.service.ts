import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Brackets } from 'typeorm';

import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../user/entities/user.entity';

import {
  addressToChange,
  requestGemini,
  generateSchedulePrompts,
} from 'util/generator';
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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  //최종 일정 생성
  async generateWithGemini(body: any) {
    const prompts = generateSchedulePrompts(body.schedule);
    const fullResult: Record<string, any[]> = {};

    for (const { prompt } of prompts) {
      const data = await requestGemini(prompt);
      const jsonStart = data.indexOf('{');
      const jsonEnd = data.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
        throw new Error('유효한 JSON 범위를 찾을 수 없습니다.');
      }
      const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonSubstring);
      Object.assign(fullResult, parsed); // 날짜 키로 합침
    }

    // 이후 코드는 기존과 동일하게 진행
    const dates = Object.keys(fullResult);
    const userData = await this.userRepository.findOne({
      where: { id: body.schedule.userId },
    });
    if (!userData) {
      throw new Error('유저를 찾을 수 없습니다');
    }

    const createTripData: Partial<Trip> = {
      title: body.schedule.location,
      startDate: new Date(dates[0]),
      endDate: new Date(dates[dates.length - 1]),
      user: userData,
    };

    const trip = await this.tripRepository.save(createTripData);

    const entries = Object.entries(fullResult);
    for (let i = 0; i < entries.length; i++) {
      const [dateStr, schedules] = entries[i];
      const dayData = {
        date: dateStr,
        todayOrder: i + 1,
        trip: trip,
      };
      const savedDay = await this.tripDayRepository.save(dayData);

      for (const item of schedules as any) {
        const {
          순서: todayOrder,
          start,
          end,
          장소: placeName,
          위도: lat,
          경도: lng,
          주소: address,
          타입: category,
          image,
          rating,
          reviewCount,
        } = item;
        let finalLat = lat;
        let finalLng = lng;

        // 위경도 누락 시 Kakao API로 보완
        if (!finalLat || !finalLng) {
          try {
            const result = await addressToChange(address);
            finalLat = result.latitude;
            finalLng = result.longitude;
          } catch (error) {
            console.warn(`${placeName}의 위경도 검색 실패: ${error.message}`);
          }
        }

        const savedPlace = await this.placeRepository.save({
          name: placeName,
          category,
          address,
          lat: finalLat,
          lng: finalLng,
          todayOrder,
          trip,
          tripDay: savedDay,
          image,
          rating,
          reviewCount,
        });

        await this.tripScheduleItemRepository.save({
          startTime: start,
          endTime: end,
          title: placeName,
          todayOrder,
          trip,
          tripDay: savedDay,
          place: savedPlace,
        });
      }
    }

    const post = this.postRepository.create({
      user: userData,
      trip,
    });
    const savedPost = await this.postRepository.save(post);
    return savedPost.id;
  }
  //일정 생성하기 전 프리뷰
  // async previewGeneratedTrip(body: any) {
  //   const str = generateSchedulePrompt(body);
  //   const data = await requestGemini(str);

  //   try {
  //     //  JSON 부분만 추출
  //     const jsonStart = data.indexOf('{');
  //     const jsonEnd = data.lastIndexOf('}');
  //     const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);

  //     const parsedData = JSON.parse(jsonSubstring);
  //     const entries: [string, any[]][] = Object.entries(parsedData); // [['2025-05-14 (수)', [...]], ...]

  //     const previewTrip = {
  //       title: body.location,
  //       startDate: new Date(Object.keys(parsedData)[0]),
  //       endDate: new Date(Object.keys(parsedData).slice(-1)[0]),
  //       tripDays: entries.map(([date, schedules], index) => {
  //         const dayOrder = index + 1;

  //         const places = schedules.map((item: any) => ({
  //           name: item.장소,
  //           category: item.타입,
  //           address: item.주소,
  //           lat: item.위도,
  //           lng: item.경도,
  //           todayOrder: item.순서,
  //           image: item.image,
  //         }));

  //         const scheduleItems = schedules.map((item: any) => ({
  //           title: item.장소,
  //           startTime: item.start,
  //           endTime: item.end,
  //           todayOrder: item.순서,
  //         }));

  //         return {
  //           date,
  //           todayOrder: dayOrder,
  //           places,
  //           scheduleItems,
  //         };
  //       }),
  //     };

  //     return previewTrip;
  //   } catch (error) {
  //     console.error('프리뷰 생성 중 오류 발생:', error);
  //     throw new Error('프리뷰 생성 실패');
  //   }
  // }

  async findAll() {
    const data: any = await this.tripRepository.find({
      relations: [
        'user',
        'tripDays',
        'tripDays.scheduleItems',
        'tripDays.place',
      ],
    });

    return data;
  }

  // 여행 일정 비교해서 끝난 유저, 일정 찾기
  async getTripsEndYesterday(currentDate: Date): Promise<
    {
      userId: number;
      tripId: number;
      tripTitle: string;
    }[]
  > {
    const startOfYesterday = new Date(currentDate);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const trips = await this.tripRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.user', 'user')
      .leftJoinAndSelect('trip.post', 'post')
      .where('trip.endDate BETWEEN :start AND :end', {
        start: startOfYesterday.toISOString().slice(0, 10),
        end: endOfYesterday.toISOString().slice(0, 10),
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('post.type IS NULL') // post가 없는 경우 포함
            .orWhere('post.type = :postType', { postType: false }); // post.type이 false인 경우 포함
        }),
      )
      .getMany();

    return trips.map((trip) => ({
      userId: trip.user.id,
      tripId: trip.id,
      tripTitle: trip.title,
    }));
  }
}
