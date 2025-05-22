import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
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
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AlbumImageSubmitDto } from './dto/albumImageSubmit.dto';
import { UpdateAlbumDto } from './dto/updateAlbum.dto';
import { getDetailDataDto } from './dto/getDetailData.dto';
@ApiTags('Album')
@ApiExtraModels(
  SubmitAlbumDto,
  UserRoleDto,
  AlbumImageSubmitDto,
  getDetailDataDto,
)
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

  @Post('submitImage')
  @ApiOperation({
    summary: '해당 앨범 이미지 등록',
    description: '',
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads/albums/images', // 저장할 경로 지정
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `album-${uniqueSuffix}${ext}`; // 파일명 설정
          callback(null, filename);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 제한
    }),
  )
  @ApiBody({ type: AlbumImageSubmitDto })
  @ApiResponse({
    status: 201,
    description: '업로드 결과 반환',
    schema: {
      example: {
        result: true,
      },
    },
  })
  async albumImageSubmit(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      albumId: number;
      userId: number;
    },
  ) {
    const { albumId, userId } = body;
    const fileUrls = files.map((file) => {
      // 서버 URL이 있다면 http://localhost:3000/uploads/albums/filename 이런 식으로 가능
      return `/uploads/albums/images/${file.filename}`;
    });
    const result = await this.albumService.albumSubmitImage(
      albumId,
      userId,
      fileUrls,
    );
    return { result: result };
  }

  @Post('update/title')
  @ApiOperation({
    summary: '해당 앨범 타이틀 및 이미지 수정',
    description: '타이틀 또는 대표 이미지 중 하나만 수정도 가능',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/albums/head',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `album-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 제한
    }),
  )
  @ApiBody({ type: AlbumImageSubmitDto })
  @ApiResponse({
    status: 201,
    description: '업데이트 결과 반환',
    schema: {
      example: {
        result: true,
        message: '앨범이 성공적으로 업데이트되었습니다.',
      },
    },
  })
  async albumHeadUpdate(
    @Body()
    body: UpdateAlbumDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const { albumId, userId, title } = body;

    // file이 있을 때만 URL 설정
    const fileUrl = file ? `/uploads/albums/head/${file.filename}` : null;

    const result = await this.albumService.albumUpdateHead(
      albumId,
      userId,
      fileUrl,
      title,
    );
    return result;
  }

  @Get('photoinfo')
  @ApiResponse({
    status: 200,
    description: '앨범 이미지 상세 정보',
    type: getDetailDataDto,
  })
  @ApiOperation({
    summary: '앨범 상세 조회',
    description: '특정 앨범의 상세 정보를 조회합니다.',
  })
  async getAlbumPhotoData(@Param('AlbumId') albumId: number) {
    return await this.albumService.findDetailData(albumId);
  }
}
