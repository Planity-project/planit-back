import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Location } from 'src/modules/location/entities/location.entity';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { SERVER_DOMAIN } from 'util/api';
import { shuffleArray } from 'util/generator';
import { dedupePlaces } from 'util/caching';

export const locationArr = [
  {
    country: '대한민국',
    name: '제주',
    lat: 33.5097,
    lng: 126.5219,
    radius: 25000,
  },
  {
    country: '대한민국',
    name: '부산',
    lat: 35.1667,
    lng: 129.0667,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '서울',
    lat: 37.5326,
    lng: 127.0246,
    radius: 7000,
  },
  {
    country: '대한민국',
    name: '경주',
    lat: 35.8354,
    lng: 129.2639,
    radius: 12000,
  },
  { country: '대한민국', name: '강릉', lat: 37.75, lng: 128.9, radius: 12000 },
  {
    country: '대한민국',
    name: '여수',
    lat: 34.7628,
    lng: 127.6653,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '거제',
    lat: 34.8804,
    lng: 128.6217,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '통영',
    lat: 34.8545,
    lng: 128.4331,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '전주',
    lat: 35.8219,
    lng: 127.1489,
    radius: 10000,
  },
  { country: '대한민국', name: '남원', lat: 35.41, lng: 127.39, radius: 10000 },
  {
    country: '대한민국',
    name: '포항',
    lat: 36.0322,
    lng: 129.365,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '대전',
    lat: 36.351,
    lng: 127.385,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '인천',
    lat: 37.483,
    lng: 126.633,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '춘천',
    lat: 37.867,
    lng: 127.733,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '군산',
    lat: 35.9833,
    lng: 126.7167,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '목포',
    lat: 34.7667,
    lng: 126.35,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '안동',
    lat: 36.5667,
    lng: 128.7167,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '가평',
    lat: 37.8315,
    lng: 127.5097,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '제천',
    lat: 37.1333,
    lng: 128.2,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '수원',
    lat: 37.2636,
    lng: 127.0286,
    radius: 8000,
  },
  {
    country: '대한민국',
    name: '영월',
    lat: 37.1835,
    lng: 128.4611,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '대구',
    lat: 35.8722,
    lng: 128.6025,
    radius: 10000,
  },
];

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
  ) {}

  async runSeed() {
    await this.adminRepo.delete({});
    await this.locationRepo.delete({});

    const user = this.adminRepo.create({
      email: 'admin@abc.abc',
      password: '#a1234567',
    });
    await this.adminRepo.save(user);

    const locations = locationArr.map((item) =>
      this.locationRepo.create({
        country: item.country,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
      }),
    );

    await this.locationRepo.save(locations);
  }

  async generatePlaceJson() {
    const categoryMap = {
      명소: 'tourist_attraction',
      식당: 'restaurant',
      카페: 'cafe',
      숙소: 'lodging',
    };

    const data: Record<string, any[]> = {};

    const totalSteps = locationArr.length * Object.values(categoryMap).length;
    let completedSteps = 0;

    for (const loc of locationArr) {
      const { name, lat, lng } = loc;
      let results: any[] = [];

      for (const category of Object.values(categoryMap)) {
        const items = await this.searchToursGoogle(
          String(lat),
          String(lng),
          2,
          category,
        );
        results.push(...items);

        completedSteps++;
        const percent = ((completedSteps / totalSteps) * 100).toFixed(1);
        console.log(`진행률: ${percent}% (${completedSteps} / ${totalSteps})`);
      }
      results = dedupePlaces(results);

      data[name] = shuffleArray(results);
      console.log(`✅ ${name} 완료`, data[name]);
    }

    const filePath = path.join(__dirname, 'data', 'places.json');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('🎉 장소 데이터 저장 완료:', filePath);
  }

  private async searchToursGoogle(
    lat: string,
    lon: string,
    maxPage: number,
    type: string,
  ): Promise<any[]> {
    const radius = 20000;
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const key = process.env.GOOGLE_MAP_KEY;

    const params = {
      location: `${lat},${lon}`,
      radius,
      key,
      type,
      language: 'ko',
    };

    let results: any[] = [];
    let currentPage = 0;
    let nextPageToken: string | null = null;

    while (currentPage <= maxPage) {
      let response;

      if (nextPageToken && currentPage > 0) {
        await new Promise((res) => setTimeout(res, 2500)); // 최소 2초 대기 필수
        response = await axios.get(baseUrl, {
          params: {
            pagetoken: nextPageToken,
            key,
            language: 'ko',
          },
        });
      } else {
        response = await axios.get(baseUrl, { params });
      }

      const data = response.data;

      if (data.status !== 'OK' || !data.results) break;

      const pageResults = data.results.map((item: any) => ({
        place_id: item.place_id,
        title: item.name,
        category: this.mapGoogleCategory(item.types),
        imageSrc: item.photos?.[0]
          ? `${SERVER_DOMAIN}/map/photo-proxy?ref=${item.photos[0].photo_reference}`
          : '',
        lat: item.geometry.location.lat,
        lon: item.geometry.location.lng,
        address: item.vicinity || '주소 없음',
        tel: '',
        rating: item.rating ?? null,
        reviewCount: item.user_ratings_total ?? 0,
        openNow: item.opening_hours?.open_now ?? null,
      }));

      results.push(...pageResults);

      nextPageToken = data.next_page_token;
      if (!nextPageToken) break;

      currentPage++;
    }
    return results;
  }

  private mapGoogleCategory(types: string[]): string {
    if (types.includes('cafe')) return '카페';
    if (types.includes('restaurant')) return '식당';
    if (types.includes('lodging')) return '숙소';
    if (types.includes('tourist_attraction')) return '명소';
    return '기타';
  }
}
