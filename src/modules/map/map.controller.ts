import {
  Controller,
  HttpException,
  HttpStatus,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MapService } from './map.service';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('nearby')
  async searchNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    if (!latitude || !longitude) {
      console.error('위도 경도 입력 필요');
      throw new HttpException('위도 경도 입력 필요 .', HttpStatus.BAD_REQUEST);
    }

    try {
      const locations = await this.mapService.searchKakao(latitude, longitude);
      return { locations };
    } catch (error) {
      console.error('searchNearby', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
