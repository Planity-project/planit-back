import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MapService } from './map.service';
import { addressToChange, shuffleArray } from 'util/generator';
import { SearchInputNearbyDto } from './dto/SearchInputNearby.dto';
import { SearchNearbyDto, NearbyResponseDto } from './dto/SearchNearby.dto';
import { AddressChange, PlaceInfoDto } from './dto/AddressChange.dto';
import {
  ApiTags,
  ApiOperation,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { CacheService } from 'src/cache/cache.service';
import {
  getFromCache,
  clearCache,
  generateGridCenters,
  dedupePlaces,
  getLocationByName,
  saveToCache,
} from 'util/caching';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import axios from 'axios';

const placeTypes = [
  'tourist_attraction', // 명소
  'restaurant', // 식당
  'cafe', // 카페
  'museum', // 박물관
  'art_gallery', // 미술관
  'park', // 공원
  'shopping_mall', // 쇼핑몰
  'department_store', // 백화점
  'book_store', // 서점
  'spa', // 스파
  'beauty_salon', // 미용실
  'amusement_park', // 놀이공원
  'zoo', // 동물원
  'aquarium', // 아쿠아리움
];

@ApiTags('Map')
@ApiExtraModels(SearchNearbyDto, SearchInputNearbyDto, AddressChange)
@Controller('map')
export class MapController {
  constructor(
    private readonly mapService: MapService,
    private readonly cacheService: CacheService,
  ) {}

  @Post('searchNearby')
  @ApiOperation({
    summary: '주소 + 검색어 기반 관광/숙박 장소 검색 (JSON 파일 기반)',
  })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchInputNearby(@Body() body: SearchInputNearbyDto) {
    const { address, page = 0, type, str } = body;

    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const placesFilePath = path.join(
        process.cwd(),
        'src',
        'seed',
        'data',
        'places.json',
      );
      const rawData = fs.readFileSync(placesFilePath, 'utf-8');
      const placesData = JSON.parse(rawData);

      const regionPlaces = placesData[address];
      if (!regionPlaces) {
        throw new HttpException(
          '해당 지역을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      let filtered = regionPlaces;

      // 검색어(str) 포함 필터링
      if (str && str.trim() !== '') {
        const keyword = str.trim().toLowerCase();
        filtered = filtered.filter((place) =>
          place.title.toLowerCase().includes(keyword),
        );
      }

      // type에 따른 카테고리 필터링
      if (type === 1) {
        const allowedCategories = ['명소', '식당', '카페'];
        filtered = filtered.filter((place) =>
          allowedCategories.includes(place.category),
        );
      } else if (type === 2) {
        filtered = filtered.filter((place) => place.category === '숙소');
      }

      // 페이징 처리 (page 0은 10개, 이후는 10개씩)
      const pageSize = 10;
      const startIdx = page === 0 ? 0 : 20 + (Number(page) - 1) * 10;
      const paged = filtered.slice(startIdx, startIdx + pageSize);

      // 첫 페이지는 셔플
      const resultList = page === 0 ? shuffleArray(paged) : paged;

      return { locations: resultList };
    } catch (error) {
      console.error('searchInputNearby error:', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('addressChange')
  @ApiOperation({ summary: '장소 등록' })
  @ApiResponse({ status: 200, type: PlaceInfoDto })
  async addressChange(@Query() query: AddressChange) {
    const { keyword } = query;
    const { latitude, longitude } = await addressToChange(keyword);

    return this.mapService.searchPlacesLatLng(latitude, longitude);
  }

  @Post('nearby')
  @ApiOperation({ summary: 'JSON 데이터 기반 관광/숙박 장소 검색' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchNearby2(@Body() body: SearchNearbyDto) {
    const { address, page = 0, type, categories } = body;

    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const placesFilePath = join(
        process.cwd(),
        'src',
        'seed',
        'data',
        'places.json',
      );

      const rawData = readFileSync(placesFilePath, 'utf-8');
      const placesData = JSON.parse(rawData);

      const regionPlaces = placesData[address];
      if (!regionPlaces) {
        throw new HttpException(
          '해당 지역을 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      // type에 따른 카테고리 필터링
      let filtered = regionPlaces;

      if (type === 1) {
        // type 1 → 명소, 식당, 카페
        const allowedCategories = ['명소', '식당', '카페'];
        filtered = filtered.filter((place) =>
          allowedCategories.includes(place.category),
        );
      } else if (type === 2) {
        // type 2 → 숙소만
        filtered = filtered.filter((place) => place.category === '숙소');
      }

      // 추가로, body.categories 배열이 있으면 거기에 맞게 필터링
      if (Array.isArray(categories) && categories.length > 0) {
        filtered = filtered.filter((place) =>
          categories.includes(place.category),
        );
      }

      // 페이지 사이즈: page가 0일 때 20개, 이후 페이지는 10개씩
      const pageSize = 10;

      const startIdx = page === 0 ? 0 : 20 + (page - 1) * 10;
      const paged = filtered.slice(startIdx, startIdx + pageSize);
      console.log('시작', paged, '끝');
      // 셔플은 첫 페이지에서만 실행
      const shuffled = page === 0 ? shuffleArray(paged) : paged;
      return { locations: shuffled };
    } catch (error) {
      console.error('searchNearby error:', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //구글 이미지 얻어오는 주소
  @Get('photo-proxy')
  @ApiOperation({ summary: 'Google Place 이미지 프록시' })
  @ApiResponse({ status: 200, description: '이미지 스트림 반환' })
  async proxyPhoto(@Query('ref') ref: string, @Res() res: Response) {
    try {
      const key = process.env.GOOGLE_MAP_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${ref}&key=${key}`;
      const response = await axios.get(url, { responseType: 'stream' });

      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } catch (error) {
      console.error('photo-proxy error:', error.message);
      throw new HttpException('이미지 요청 실패', HttpStatus.BAD_GATEWAY);
    }
  }
}
