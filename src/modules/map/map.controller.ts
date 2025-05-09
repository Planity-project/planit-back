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
import { addressToChange } from 'util/generator';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('nearby')
  async searchNearby(
    @Query('address') address: string,
    @Query('page') pageNo: string,
  ) {
    if (!address) {
      console.error('주소 입력 필요');
      throw new HttpException('주소 입력 필요 .', HttpStatus.BAD_REQUEST);
    }

    try {
      const { latitude, longitude } = await addressToChange(address);
      console.log(latitude, longitude, '위도 경도');
      const locations = await this.mapService.searchTours(
        latitude,
        longitude,
        Number(pageNo),
      );
      return { locations };
    } catch (error) {
      console.error('searchNearby', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('searchNearby')
  async searchInputNearby(
    @Query('address') address: string,
    @Query('page') pageNo: string,
    @Query('str') str: string,
  ) {
    if (!address) {
      console.error('주소 입력 필요');
      throw new HttpException('주소 입력 필요 .', HttpStatus.BAD_REQUEST);
    }

    try {
      const { latitude, longitude } = await addressToChange(address);

      const locations = await this.mapService.searchInputTours(
        latitude,
        longitude,
        Number(pageNo),
        str,
      );
      return { locations };
    } catch (error) {
      console.error('searchNearby', error);
      throw new HttpException('서버 오류.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
