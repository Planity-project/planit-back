import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TripService } from './trips.service';
import { GenerateDateDto } from './dto/gereateWithGemini.dto';
import { TripFindDto } from './dto/find.dto';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiExtraModels,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import { UseGuards } from '@nestjs/common';
@ApiTags('trip')
@ApiExtraModels(GenerateDateDto)
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post('generateDate')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: GenerateDateDto })
  @ApiResponse({
    status: 201,
    description: '생성된 게시글 ID 반환',
    schema: {
      type: 'number',
      example: 1,
    },
  })
  async generateDate(@Body() body: any) {
    const result = await this.tripService.generateWithGemini(body);
    return result;
  }

  @Get('find')
  @ApiOkResponse({ description: '저장된 일정 목록 조회', type: [TripFindDto] })
  async find() {
    return await this.tripService.findAll();
  }

  @Post('preview')
  async previewDate(@Body() body: any[]) {
    const result = await this.tripService.previewGeneratedTrip(body);
    return result;
  }
}
