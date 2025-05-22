import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetMyPostDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  userId: number;

  @ApiProperty({ example: 2, description: '포스트 ID' })
  postId: number;

  @ApiProperty({ example: '재미진 여수 여행', description: '포스트 제목' })
  title: string;

  @ApiPropertyOptional({
    example: '2025-05-30',
    description: '여행 종료 날짜 (ISO 문자열)',
    nullable: true,
  })
  endDate: Date | null;
}
