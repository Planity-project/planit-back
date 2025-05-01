import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LocationsResponseDto } from './dto/create-location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('search')
  @ApiOperation({ summary: '키워드로 지역 검색' })
  @ApiBody({ description: '키워드', type: String })
  @ApiResponse({
    status: 200,
    type: LocationsResponseDto,
  })
  async locationVelidate(@Body() str: string) {
    return await this.locationService.searchKeword(str);
  }
}
