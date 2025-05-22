import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
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
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { SubmitAlbumDto, SubmitAlbumResponseDto } from './dto/submitAlbum.dto';
import { UserRoleDto } from './dto/userrole.dto';
import { findAllAlbumDto } from './dto/findAllAlbum.dto';
@ApiTags('Album')
@ApiExtraModels(SubmitAlbumDto, UserRoleDto)
@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  // 앨범 등록
  @Post('/submit')
  @ApiOperation({ summary: '앨범 생성', description: '앨범을 생성합니다.' })
  @ApiBody({ type: SubmitAlbumDto })
  @ApiResponse({
    status: 201,
    description: '성공적으로 생성됨',
    type: SubmitAlbumResponseDto,
  })
  submitAlbum(@Body() body: { userId: number; title: string; url: string }) {
    const { userId, title, url } = body;
    return this.albumService.submitAlbum(userId, title, url);
  }

  // 전체 앨범 데이터 가져오기
  @Get('allData')
  @ApiOperation({
    summary: '앨범 목록 조회',
    description: '페이징된 앨범 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'page', example: 1 })
  @ApiQuery({ name: 'limit', example: 4 })
  @ApiResponse({
    status: 200,
    description: '페이징된 앨범 목록 반환',
    type: findAllAlbumDto,
  })
  async findAllAlbum(@Query('page') page = 1, @Query('limit') limit = 4) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    return await this.albumService.findPaginated(pageNumber, limitNumber);
  }

  // 전체 앨범 디테일 가져오기
  @Get('detailData')
  @ApiOperation({
    summary: '앨범 상세 조회',
    description: '특정 앨범의 상세 정보를 조회합니다.',
  })
  async getDetailData(@Param('AlbumId') albumId: number) {
    return await this.albumService.findDetailData(albumId);
  }

  @Get('userrole')
  @ApiOperation({
    summary: '유저의 앨범 내 역할 조회',
    description: '앨범에서 유저의 역할(OWNER or MEMBER)을 조회합니다.',
  })
  async getUserRole(
    @Param('albumId') albumId: number,
    @Param('userId') userId: number,
  ) {
    const role = await this.albumService.getAlbumRole(albumId, userId);
    return { role }; // { role: 'OWNER' } 또는 { role: 'MEMBER' }
  }
}
