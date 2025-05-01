import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}
}
