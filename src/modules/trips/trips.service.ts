import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../user/entities/user.entity';

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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  //최종 일정 생성
  async generateWithGemini(body: any) {
    const str = generateSchedulePrompt(body.schedule);
    console.log(body, 'body');
    let data = await requestGemini(str);
    console.log(data, 'geminiData');
    console.log(body, 'body');
    try {
      // ✨ 혹시 JSON 앞뒤에 설명 텍스트가 붙어 있는 경우 제거
      const jsonStart = data.indexOf('{');
      const jsonEnd = data.lastIndexOf('}');
      const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);

      const parseData = JSON.parse(jsonSubstring);
      const dates = Object.keys(parseData);
      console.log(parseData, '객체 데이터');

      const userData = await this.userRepository.findOne({
        where: { id: body.schedule.userId },
      });
      if (!userData) {
        throw new Error('유저를 찾을 수 없습니다');
      }
      //   const data = await this.tripRepository.create()
      const createTripData: Partial<Trip> = {
        title: body.schedule.location,
        startDate: new Date(dates[0]),
        endDate: new Date(dates[dates.length - 1]),
        user: userData,
      };

      const trip = await this.tripRepository.save(createTripData);

      const entries = Object.entries(parseData); // [['2025-05-14 (수)', [...]], ['2025-05-15 (목)', [...]]]

      for (let i = 0; i < entries.length; i++) {
        const [dateStr, schedules] = entries[i];
        console.log(dateStr, schedules, '내부 데이터');
        const dayData = {
          date: `${dateStr}`,
          todayOrder: Number(i + 1),
          trip: trip,
        };

        const savedDay = await this.tripDayRepository.save(dayData);
        console.log(savedDay, 'savedDay');
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
          console.log(
            todayOrder,
            start,
            end,
            placeName,
            lat,
            lng,
            address,
            category,
            'item',
          );
          // 📌 장소 저장
          const savedPlace = await this.placeRepository.save({
            name: placeName,
            category,
            address,
            lat,
            lng,
            todayOrder: todayOrder,
            trip: trip,
            tripDay: savedDay,
            image: image,
            rating: rating,
            reviewCount: reviewCount,
          });

          // 📌 일정 저장
          await this.tripScheduleItemRepository.save({
            startTime: start,
            endTime: end,
            title: placeName,
            todayOrder: todayOrder,
            trip: trip,
            tripDay: savedDay,
            place: savedPlace,
          });
        }
      }
      const post = this.postRepository.create({
        user: userData,
        trip: trip,
      });
      const savedPost = await this.postRepository.save(post);
      return savedPost.id;
    } catch (error) {
      console.error(error, 'error message');
    }
  }

  //일정 생성하기 전 프리뷰
  async previewGeneratedTrip(body: any) {
    const str = generateSchedulePrompt(body);
    const data = await requestGemini(str);

    try {
      //  JSON 부분만 추출
      const jsonStart = data.indexOf('{');
      const jsonEnd = data.lastIndexOf('}');
      const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);

      const parsedData = JSON.parse(jsonSubstring);
      const entries: [string, any[]][] = Object.entries(parsedData); // [['2025-05-14 (수)', [...]], ...]

      const previewTrip = {
        title: body.location,
        startDate: new Date(Object.keys(parsedData)[0]),
        endDate: new Date(Object.keys(parsedData).slice(-1)[0]),
        tripDays: entries.map(([date, schedules], index) => {
          const dayOrder = index + 1;

          const places = schedules.map((item: any) => ({
            name: item.장소,
            category: item.타입,
            address: item.주소,
            lat: item.위도,
            lng: item.경도,
            todayOrder: item.순서,
            image: item.image,
          }));

          const scheduleItems = schedules.map((item: any) => ({
            title: item.장소,
            startTime: item.start,
            endTime: item.end,
            todayOrder: item.순서,
          }));

          return {
            date,
            todayOrder: dayOrder,
            places,
            scheduleItems,
          };
        }),
      };

      return previewTrip;
    } catch (error) {
      console.error('프리뷰 생성 중 오류 발생:', error);
      throw new Error('프리뷰 생성 실패');
    }
  }

  async findAll() {
    const data: any = await this.tripRepository.find({
      relations: [
        'user',
        'tripDays',
        'tripDays.scheduleItems',
        'tripDays.place',
      ],
    });

    console.log(data[0].tripDays[0].places, 'data');
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

    const trips = await this.tripRepository.find({
      where: {
        endDate: Between(startOfYesterday, endOfYesterday),
      },
      relations: ['user'],
    });

    return trips.map((trip) => ({
      userId: trip.user.id,
      tripId: trip.id,
      tripTitle: trip.title,
    }));
  }
}
