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
import {
  ApiTags,
  ApiOperation,
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Map')
@ApiExtraModels(SearchNearbyDto, SearchInputNearbyDto)
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('nearby')
  @ApiOperation({ summary: '주소 기반 관광/숙박 장소 검색' })
  @ApiResponse({ status: 200, type: NearbyResponseDto })
  async searchNearby(@Query() query: SearchNearbyDto) {
    const { address, page, type } = query;

    if (!address) {
      throw new HttpException('주소 입력 필요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const { latitude, longitude } = await addressToChange(address);
      const locations =
        type === 1
          ? await this.mapService.searchTours(latitude, longitude, Number(page))
          : await this.mapService.searchStayTours(
              latitude,
              longitude,
              Number(page),
            );
      return { locations };
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
        type === 1
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
}
