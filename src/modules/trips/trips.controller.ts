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
}
