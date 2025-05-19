import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwtauth.gurad';
import { AlbumService } from '../album/album.service';

@ApiTags('User (유저)')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly albumService: AlbumService,
  ) {}

  // 📌 유저 전체 목록 조회
  @Get()
  @ApiOperation({ summary: '유저 전체 목록 조회' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // 📌 블랙 리스트 조회
  @Get('/blacklist')
  @ApiOperation({ summary: '블랙리스트 회원 조회' })
  async getBlacklistedUsers() {
    return this.userService.getBlacklistedUsers();
  }

  // 📌 앨범 전체 목록 조회
  @Get('/albumlist')
  getAlbumList() {
    return this.albumService.getAlbumList();
  }

  // 📌 앨범 회원 조회
  @Get('/albumUser')
  @ApiOperation({ summary: '앨범 그룹에 속한 회원 조회' })
  async getUsersInAlbum(@Query('albumId') albumId: number) {
    return this.userService.getUsersInAlbum(albumId);
  }

  // 📌 유저 단일 조회
  @Get(':id')
  @ApiOperation({ summary: '유저 상세 조회' })
  @ApiParam({ name: 'id', description: '유저 ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // ✅ 닉네임 업데이트
  @Post('nicknameUpdate')
  @ApiOperation({ summary: '사용자 닉네임 수정' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '닉네임 수정 성공',
    schema: {
      example: { result: true, message: '등록 성공' },
    },
  })
  @ApiResponse({
    status: 200,
    description: '닉네임 중복',
    schema: {
      example: { result: false, message: '이미 사용중인 닉네임입니다.' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 id',
    schema: {
      example: '유저를 찾을 수 없습니다',
    },
  })
  async userinfoModify(@Body() userData: UpdateUserDto) {
    const { id, nickname } = userData;

    // nickname이 없으면 예외 처리
    if (!nickname) {
      throw new Error('닉네임은 필수 항목입니다.');
    }

    return await this.userService.updateUserNickname(id, nickname);
  }

  // ✅ 연동된 계정 조회
  @Get('account/:id')
  @ApiOperation({ summary: '연동된 계정 조회' })
  @ApiParam({ name: 'id', type: Number, description: '유저의 ID' })
  @ApiOkResponse({ schema: { example: { type: 'kakao' } } })
  @ApiBadRequestResponse({ description: '유저를 찾을 수 없습니다.' })
  async getLoginType(@Param('id') id: number) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new HttpException(
        '유저를 찾을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { type: user.type };
  }

  // ✅ 회원 탈퇴
  @Delete('destroy/:id')
  @ApiOperation({
    summary: '회원 탈퇴',
    description: '해당 ID의 유저를 삭제합니다.',
  })
  @ApiParam({ name: 'id', type: Number, description: '삭제할 유저의 ID' })
  @ApiOkResponse({
    description: '회원 탈퇴 성공',
    schema: { example: { message: '회원 탈퇴 완료' } },
  })
  @ApiBadRequestResponse({ description: '유저를 찾을 수 없습니다.' })
  async deleteUser(@Param('id') id: number) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    await this.userService.deleteUser(id);
    return { result: true, message: '회원 탈퇴 완료' };
  }

  // ✅ 프로필 이미지 업로드 및 업데이트
  @Put('me/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 프로필 이미지 업데이트' })
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `profile-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: { fileSize: 1024 * 1024 * 5 }, // 5MB 제한
    }),
  )
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;
    if (!file) {
      return { message: '프로필 이미지를 선택해주세요.' };
    }
    await this.userService.updateProfileImage(userId, file.filename);
    return {
      result: true,
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      filename: file.filename,
    };
  }

  // ✅ 내 프로필 이미지 삭제
  @Delete('me/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 프로필 이미지 삭제' })
  async deleteProfileImage(
    @Query('userId') userId: number,
  ): Promise<{ result: boolean; message: string }> {
    await this.userService.deleteProfileImage(userId);
    return {
      result: true,
      message: '프로필 이미지가 성공적으로 삭제되었습니다.',
    };
  }

  // ✅ 관리자에 의한 여러 유저 완전 삭제
  @Delete('admin/delete')
  @ApiOperation({ summary: '관리자가 여러 유저를 완전 삭제' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2, 3],
        },
      },
    },
  })
  async deleteUsersByAdmin(
    @Body('userIds') userIds: number[],
  ): Promise<{ message: string }> {
    await this.userService.deleteUsersByAdmin(userIds);
    return { message: '선택한 유저들이 완전히 삭제되었습니다.' };
  }
}
