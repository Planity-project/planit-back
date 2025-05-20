import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Post,
  Body,
} from '@nestjs/common';
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
        return {
          locations: [],
        };
      }

      // 페이지네이션 (예: 20개씩)
      const pageSize = Number(page) === 1 ? 20 : 10;
      const paged = cached.slice(
        Number(page) * pageSize,
        (Number(page) + 1) * pageSize,
      );

      return { locations: shuffleArray(paged) };
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
  async getByRegion(@Query('name') name: string) {
    if (!name) {
      console.log('지역명 없음');
      throw new HttpException('지역명이 필요합니다.', HttpStatus.BAD_REQUEST);
    }

    console.log('요청 받은 지역명:', name);

    const cacheKeyTours = `${name}-tours`;
    const cacheKeyLodging = `${name}-lodging`;

    const [cachedTours, cachedLodging] = await Promise.all([
      this.cacheService.get(cacheKeyTours),
      this.cacheService.get(cacheKeyLodging),
    ]);

    console.log('캐시 조회:', {
      tours: cachedTours?.length ?? 0,
      lodging: cachedLodging?.length ?? 0,
    });

    if (cachedTours && cachedLodging) {
      console.log('캐시 데이터 반환');
      return true;
    }

    const regionInfo = getLocationByName(name);
    if (!regionInfo) {
      console.log('지역 정보 없음');
      throw new HttpException(
        '해당 지역을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );
    }

    const { lat, lng } = regionInfo;
    const tourCategories = ['tourist_attraction', 'restaurant', 'cafe'];

    const tourTasks: Promise<any[]>[] = [];
    const lodgingTasks: Promise<any[]>[] = [];

    // 중심 좌표 한 번만 사용
    for (let page = 0; page <= 2; page++) {
      for (const category of tourCategories) {
        tourTasks.push(
          this.mapService.searchToursGoogle(
            String(lat),
            String(lng),
            page,
            category,
          ),
        );
      }

      lodgingTasks.push(
        this.mapService.searchToursGoogle(
          String(lat),
          String(lng),
          page,
          'lodging',
        ),
      );
    }

    const [tourResultsArrays, lodgingResultsArrays] = await Promise.all([
      Promise.all(tourTasks),
      Promise.all(lodgingTasks),
    ]);

    const allTourResults = tourResultsArrays.flat();
    const allLodgingResults = lodgingResultsArrays.flat();

    console.log('총 관광지 결과 개수:', allTourResults.length);
    console.log('총 숙소 결과 개수:', allLodgingResults.length);

    const dedupedTours = dedupePlaces(allTourResults);
    const dedupedLodging = dedupePlaces(allLodgingResults);

    console.log(name + ' 중복 제거 후 관광지 개수', dedupedTours.length);
    console.log(name + ' 중복 제거 후 숙소 개수', dedupedLodging.length);

    await Promise.all([
      this.cacheService.set(cacheKeyTours, shuffleArray(dedupedTours), {
        ttl: 60 * 60 * 24,
      }),
      this.cacheService.set(cacheKeyLodging, dedupedLodging, {
        ttl: 60 * 60 * 24,
      }),
    ]);

    console.log('캐시 저장 완료');
    return true;
  }

  @Post('nearby')
  @ApiOperation({ summary: '주소 + 카테고리 필터 기반 관광/숙박 장소 검색' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchNearby2(@Body() body: SearchNearbyDto) {
    const { address, page = 0, type, categories } = body;

    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const cacheKeyTours = `${address}-tours`;
      const cacheKeyLodging = `${address}-lodging`;

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

      // categories가 없거나 빈 배열이면 필터링 없이 전체 사용
      let filtered = cached;
      if (Array.isArray(categories) && categories.length > 0) {
        filtered = cached.filter((place) =>
          // place.category가 배열이면 some, 아니면 includes
          Array.isArray(place.category)
            ? place.category.some((cat: string) => categories.includes(cat))
            : categories.includes(place.category),
        );
      }

      // 페이지네이션 (20개씩)
      const pageSize = page === 0 ? 20 : 10;
      const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

      return { locations: paged };
    } catch (error) {
      console.error('searchNearby', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
