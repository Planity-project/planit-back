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
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from './entities/user.entity';
import { updateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 📌 유저 전체 목록 조회
  @Get()
  @ApiOperation({ summary: '유저 전체 목록 조회' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  // 📌 유저 단일 조회
  @Get(':id')
  @ApiOperation({ summary: '유저 상세 조회' })
  @ApiParam({ name: 'id', description: '유저 ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // 📌 유저 정보 업데이트
  // @Patch(':id')
  // @ApiOperation({ summary: '회원 정보 수정' })
  // @ApiParam({ name: 'id', description: '회원 ID' })
  // @ApiBody({ type: UpdateUserDto })
  // updateUser(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdateUserDto,
  // ): Promise<User> {
  //   return this.userService.update(id, dto);
  // }

  // ✅ 닉네임 업데이트
  @Post('update')
  @ApiOperation({ summary: '사용자 닉네임 수정' })
  @ApiBody({ type: updateUserDto })
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
  async userinfoModify(@Body() userData: updateUserDto) {
    const { id, nickname } = userData;

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
    return { message: '회원 탈퇴 완료' };
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
      message: '프로필 이미지가 성공적으로 업데이트되었습니다.',
      filename: file.filename,
    };
  }

  // ✅ 내 프로필 이미지 삭제
  @Delete('me/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 프로필 이미지 삭제' })
  async deleteProfileImage(@Request() req): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.userService.deleteProfileImage(userId);
    return { message: '프로필 이미지가 성공적으로 삭제되었습니다.' };
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
