import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { MapService } from './map.service';
import { addressToChange } from 'util/generator';
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

@ApiTags('Map')
@ApiExtraModels(SearchNearbyDto, SearchInputNearbyDto, AddressChange)
@Controller('map')
export class MapController {
  constructor(
    private readonly mapService: MapService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('nearby')
  @ApiOperation({ summary: '주소 기반 관광/숙박 장소 검색' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchNearby(@Query() query: SearchNearbyDto) {
    const { address, page, type } = query;
    console.log(address, 'address');
    const cacheKeyTours = `${address}-tours`;
    const cacheKeyLodging = `${address}-lodging`;
    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      let cached: any[] | null;
      if (Number(type) === 1) {
        cached = await this.cacheService.get<any[]>(cacheKeyTours);
      } else {
        cached = await this.cacheService.get<any[]>(cacheKeyLodging);
      }
      if (!cached) {
        throw new HttpException(
          '해당 지역 데이터 없음. 먼저 /place 요청 필요.',
          HttpStatus.NOT_FOUND,
        );
      }

      // 페이지네이션 (예: 20개씩)
      const pageSize = 20;
      const paged = cached.slice(
        Number(page) * pageSize,
        (Number(page) + 1) * pageSize,
      );

      return { locations: paged };
    } catch (error) {
      console.error('searchNearby', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('searchNearby')
  @ApiOperation({ summary: '주소 + 검색어 기반 관광/숙박 장소 검색' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchInputNearby(@Query() query: SearchInputNearbyDto) {
    const { address, page, type, str } = query;

    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const { latitude, longitude } = await addressToChange(address);
      const locations =
        Number(type) === 1
          ? await this.mapService.searchInputTours(
              latitude,
              longitude,
              Number(page),
              str,
            )
          : await this.mapService.searchStayInputTours(
              latitude,
              longitude,
              Number(page),
              str,
            );
      return { locations };
    } catch (error) {
      console.error('searchInputNearby', error);
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

  @Get('place')
  @ApiOperation({ summary: '지역 기반 장소 데이터 캐시 + 반환' })
  @ApiOkResponse({ type: NearbyResponseDto })
  async getByRegion(@Query('name') name: string) {
    if (!name) {
      throw new HttpException('지역명이 필요합니다.', HttpStatus.BAD_REQUEST);
    }
    console.log(name, 'name');
    // 관광, 숙박용 캐시 키 분리
    const cacheKeyTours = `${name}-tours`;
    const cacheKeyLodging = `${name}-lodging`;

    const cachedTours = await this.cacheService.get(cacheKeyTours);
    const cachedLodging = await this.cacheService.get(cacheKeyLodging);
    console.log(cachedTours, cachedLodging, 'test');
    if (cachedTours && cachedLodging) {
      return {
        tours: cachedTours,
        lodging: cachedLodging,
      };
    }

    const regionInfo = getLocationByName(name);

    if (!regionInfo) {
      throw new HttpException(
        '해당 지역을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    const { lat, lng } = regionInfo;
    const gridPoints = generateGridCenters(lat, lng);

    // 결과 배열 초기화
    const allToursResults: any[] = [];
    const allLodgingResults: any[] = [];

    // 동시에 요청 처리 (Promise.all)
    await Promise.all(
      gridPoints.flatMap((point) =>
        [0, 1, 2].map(async (page) => {
          const [tours, lodging] = await Promise.all([
            this.mapService.searchToursGoogle(
              String(point.lat),
              String(point.lng),
              page,
              'tourist_attraction',
            ),
            this.mapService.searchToursGoogle(
              String(point.lat),
              String(point.lng),
              page,
              'lodging',
            ),
          ]);
          allToursResults.push(...tours);
          allLodgingResults.push(...lodging);
        }),
      ),
    );

    // 중복 제거
    const dedupedTours = dedupePlaces(allToursResults);
    const dedupedLodging = dedupePlaces(allLodgingResults);

    // 캐시에 저장 (1시간)
    await Promise.all([
      this.cacheService.set(cacheKeyTours, dedupedTours, { ttl: 60 * 60 }),
      this.cacheService.set(cacheKeyLodging, dedupedLodging, { ttl: 60 * 60 }),
    ]);

    console.log('📦 [캐시 저장 완료]');
    console.log('🎯 관광지', dedupedTours.length, '개 저장:', cacheKeyTours);
    console.log('🏨 숙소', dedupedLodging.length, '개 저장:', cacheKeyLodging);

    // 또는 일부 내용만 보기 원할 경우 예시:
    console.log('예시 관광지:', dedupedTours.slice(0, 3));
    console.log('예시 숙소:', dedupedLodging.slice(0, 3));

    return {
      tours: dedupedTours,
      lodging: dedupedLodging,
    };
  }
}
