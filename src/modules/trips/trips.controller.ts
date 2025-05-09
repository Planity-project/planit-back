import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TravelService } from './trips.service';
@Controller('travel')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}
}
