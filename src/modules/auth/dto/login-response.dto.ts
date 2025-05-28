import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';

export class LoginResponseDto {
  @ApiProperty({ description: '로그인 성공 여부', example: true })
  result: boolean;

  @ApiProperty({
    description: 'JWT 토큰',
    example: 'abc.def.ghi',
    required: false,
  })
  token?: string;

  @ApiProperty({
    description: '신고 누적으로 정지된 유저 여부',
    example: false,
    required: false,
  })
  isSuspended?: boolean;

  @ApiProperty({
    description: '리다이렉트 주소',
    example: 'main',
    required: false,
  })
  redirect?: string;

  @ApiProperty({
    description: '유저 정보',
    type: () => User,
    required: false,
  })
  user?: Partial<User>;

  @ApiProperty({ description: '오류 메시지', required: false })
  message?: string;

  @ApiProperty({ description: '에러', required: false })
  error?: any;

  @ApiProperty({
    description: '정지 사유',
    example: '부적절한 게시물 반복 업로드',
    required: false,
  })
  reason?: string;

  @ApiProperty({
    description: '정지 해제 예정일 (ISO 형식)',
    example: '2025-06-30T23:59:59.000Z',
    required: false,
  })
  endDate?: string;
}
