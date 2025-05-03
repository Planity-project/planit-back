import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { updateUserDto } from './dto/create-user.dto';
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

  //닉네임 업데이트
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

  //연동된 계정 조회
  @Get('account/:id')
  @ApiOperation({ summary: '연동된 계정 조회' })
  @ApiParam({ name: 'id', type: Number, description: '유저의 ID' })
  @ApiOkResponse({ schema: { example: { type: 'kakao' } } })
  @ApiBadRequestResponse({ description: '유저를 찾을 수 없습니다.' })
  async getUserType(@Param('id') id: number) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new HttpException(
        '유저를 찾을 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { type: user.type };
  }

  //회원 탈퇴
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
}
