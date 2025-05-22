import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    example: { id: 1, email: 'user@example.com' },
    description: '알림을 받을 사용자 (요약 정보 또는 사용자 ID)',
  })
  user: any;

  @ApiProperty({
    example: '신고가 접수되었습니다.',
    description: '알림 내용',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example: { id: 5, title: '신고된 게시글 제목' },
    description: '관련 게시글 정보 (선택)',
  })
  @IsOptional()
  post?: any | null;

  @ApiPropertyOptional({
    example: { id: 10, reason: '욕설 포함' },
    description: '관련 신고 정보 (선택)',
  })
  @IsOptional()
  report?: any | null;

  @ApiPropertyOptional({
    example: { id: 3, name: '가족여행 앨범' },
    description: '관련 앨범 정보 (선택)',
  })
  @IsOptional()
  album?: any | null;

  @ApiPropertyOptional({
    example: { id: 2, title: '가족 앨범 그룹' },
    description: '관련 앨범 그룹 정보 (선택)',
  })
  @IsOptional()
  albumGroup?: any | null;

  @ApiPropertyOptional({
    example: { id: 7, title: '제주도 여행' },
    description: '관련 여행 정보 (선택)',
  })
  @IsOptional()
  trip?: any | null;

  @ApiPropertyOptional({
    example: 'REPORT',
    description: '알림 유형 (NORMAL | ALBUM | REPORT | POST | TRIP)',
  })
  @IsOptional()
  @IsEnum(['ALBUM', 'REPORT', 'POST', 'TRIP'])
  type?: 'ALBUM' | 'REPORT' | 'POST' | 'TRIP';
}
