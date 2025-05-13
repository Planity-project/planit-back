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
    example: 'REPORT',
    description: '알림 유형 (예: REPORT)',
  })
  @IsOptional()
  @IsEnum(['REPORT', 'ALARM'])
  type?: 'REPORT' | 'ALARM';
}
