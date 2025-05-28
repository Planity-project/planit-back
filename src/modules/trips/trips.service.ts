import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Brackets } from 'typeorm';

import { Place } from './entities/place.entity';
import { TripDay } from './entities/tripday.entity';
import { TripScheduleItem } from './entities/tripscheduleitems.entity';
import { Trip } from './entities/trips.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { Mutex } from 'async-mutex';

import {
  addressToChange,
  requestGemini,
  generateSchedulePrompt,
  generateSchedulePrompts,
  generateSchedulePromptEn,
} from 'util/generator';

const userMutexes = new Map<number, Mutex>();
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
    console.log('🔷 generateWithGemini 시작');

    try {
      const userId = body.schedule.userId;
      console.log('👤 userId:', userId);

      if (!userMutexes.has(userId)) {
        console.log('🔒 Mutex 생성');
        userMutexes.set(userId, new Mutex());
      }

      return await userMutexes.get(userId)!.runExclusive(async () => {
        console.log('🔐 Mutex 획득 완료');

        const fullSchedule = body.schedule;
        const dates = fullSchedule.dataTime.map((d) => d.date);
        console.log('📆 전체 날짜 목록:', dates);

        let combinedResult = {};

        for (let i = 0; i < dates.length; i += 2) {
          const chunkDates = dates.slice(i, i + 2);
          console.log(`🧩 Chunk ${i / 2}:`, chunkDates);

          const chunkDataTime = fullSchedule.dataTime.filter((d) =>
            chunkDates.includes(d.date),
          );
          const chunkDataStay = fullSchedule.dataStay.filter((s) =>
            chunkDates.includes(s.date),
          );

          const partialSchedule = {
            dataTime: chunkDataTime,
            dataPlace: fullSchedule.dataPlace,
            dataStay: chunkDataStay,
            userId,
            location: fullSchedule.location,
          };

          const prompt = generateSchedulePrompt(partialSchedule);
          console.log('📝 Gemini Prompt 생성됨');

          const data = await requestGemini(prompt);
          console.log('✅ Gemini 응답 수신:', data?.slice(0, 100)); // 너무 길면 일부만 출력

          const jsonStart = data.indexOf('{');
          const jsonEnd = data.lastIndexOf('}');
          if (jsonStart === -1 || jsonEnd === -1 || jsonStart > jsonEnd) {
            throw new Error('유효한 JSON 범위를 찾을 수 없습니다.');
          }

          const jsonSubstring = data.slice(jsonStart, jsonEnd + 1);
          const partialResult = JSON.parse(jsonSubstring);
          console.log('📦 Partial result parsed:', Object.keys(partialResult));

          combinedResult = { ...combinedResult, ...partialResult };
        }

        console.log('💾 모든 결과 결합 완료, DB 저장 시도');

        const result = await this.saveTripFromResult(
          combinedResult,
          fullSchedule,
        );

        console.log('✅ DB 저장 완료, 결과:', result);
        return result;
      });
    } catch (error) {
      console.error('🔥 generateWithGemini error:', error);
      throw error; // Nest가 500 에러로 처리
    }
  }

  async saveTripFromResult(fullResult: any, fullSchedule: any) {
    console.log('🔹 saveTripFromResult 시작');

    const dates = Object.keys(fullResult);
    console.log('📆 날짜 키:', dates);

    const userData = await this.userRepository.findOne({
      where: { id: fullSchedule.userId },
    });
    if (!userData) {
      console.error('❌ 유저를 찾을 수 없습니다:', fullSchedule.userId);
      throw new Error('유저를 찾을 수 없습니다');
    }

    return await this.tripRepository.manager.transaction(
      async (transactionalEntityManager) => {
        console.log('🔐 트랜잭션 시작');

        const createTripData: Partial<Trip> = {
          title: fullSchedule.location,
          startDate: new Date(dates[0]),
          endDate: new Date(dates[dates.length - 1]),
          user: userData,
        };

        const trip = await transactionalEntityManager.save(
          Trip,
          createTripData,
        );
        console.log('📌 Trip 저장 완료:', trip.id);

        const entries = Object.entries(fullResult);

        for (let i = 0; i < entries.length; i++) {
          const [dateStr, schedules] = entries[i];
          console.log(`📅 TripDay 저장 시도: ${dateStr}`);

          const dayData = {
            date: dateStr,
            todayOrder: i + 1,
            trip: trip,
          };

          const savedDay = await transactionalEntityManager.save(
            TripDay,
            dayData,
          );
          console.log(
            `✅ TripDay 저장됨 (ID: ${savedDay.id}, Order: ${dayData.todayOrder})`,
          );

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

            if (!finalLat || !finalLng) {
              try {
                console.log(`📍 위경도 없음 → 주소로 변환 시도: ${address}`);
                const result = await addressToChange(address);
                finalLat = result.latitude;
                finalLng = result.longitude;
                console.log(`🧭 변환 결과: lat=${finalLat}, lng=${finalLng}`);
              } catch (error) {
                console.warn(
                  `⚠️ ${placeName} 위경도 검색 실패: ${error.message}`,
                );
              }
            }

            const savedPlace = await transactionalEntityManager.save(Place, {
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

            console.log(`✅ Place 저장 완료: ${savedPlace.id} (${placeName})`);

            await transactionalEntityManager.save(TripScheduleItem, {
              startTime: start,
              endTime: end,
              title: placeName,
              todayOrder,
              trip,
              tripDay: savedDay,
              place: savedPlace,
            });

            console.log(`📋 TripScheduleItem 저장 완료: ${placeName}`);
          }
        }

        const post = this.postRepository.create({
          user: userData,
          trip,
        });

        const savedPost = await transactionalEntityManager.save(Post, post);
        console.log(`📝 Post 저장 완료: ${savedPost.id}`);

        return savedPost.id;
      },
    );
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
