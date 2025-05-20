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

  // 앨범 등록
  @Post('/submit')
  submitAlbum(@Body() body: { userId: number; title: string; url: string }) {
    const { userId, title, url } = body;
    return this.albumService.submitAlbum(userId, title, url);
  }

  // 전체 앨범 데이터 가져오기
  @Get('allData')
  async findAllAlbum() {
    return await this.albumService.findAll();
  }

  // 전체 앨범 디테일 가져오기
  @Get('detailData')
  async getDetailData(@Param('AlbumId') albumId: number) {
    return await this.albumService.findDetailData(albumId);
  }

  @Get('userrole')
  async getUserRole(
    @Param('albumId') albumId: number,
    @Param('userId') userId: number,
  ) {
    const role = await this.albumService.getAlbumRole(albumId, userId);
    return { role }; // { role: 'OWNER' } 또는 { role: 'MEMBER' }
  }
}
