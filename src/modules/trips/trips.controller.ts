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
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post('generateDate')
  async generateDate(@Body() body: any[]) {
    const result = await this.tripService.generateWithGemini(body);
    return result;
  }

  @Get('find')
  async find() {
    return await this.tripService.findAll();
  }

  @Post('preview')
  async previewDate(@Body() body: any[]) {
    const result = await this.tripService.previewGeneratedTrip(body);
    return result;
  }
}
