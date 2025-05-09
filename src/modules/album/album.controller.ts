import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post('submit')
  async submitAlbum(@Body() userId: number, title: string) {
    return await this.albumService.submitAlbum(userId, title);
  }

  @Get('allData')
  async findAllAlbum() {
    return await this.albumService.findAll();
  }

  @Get('detailData')
  async getDetailData(@Param('AlbumId') albumId: number) {
    return await this.albumService.findDetailData(albumId);
  }
}
