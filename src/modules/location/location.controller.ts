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
import { ApiOperation, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { LocationsResponseDto } from './dto/locationFindAll.dto';
import { LocationDto } from './dto/locationFindAll.dto';
@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('/findAll')
  @ApiOperation({ summary: '모든 지역 반환' })
  @ApiResponse({ status: 200, type: LocationsResponseDto })
  async locationFindAll() {
    return await this.locationService.locationFindAll();
  }

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
