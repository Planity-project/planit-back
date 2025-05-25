import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostItemDto {
  @ApiProperty({ example: 123, description: '포스트 ID' })
  id: number;

  @ApiProperty({ example: 45, description: '작성자 유저 ID' })
  userid: number;

  @ApiProperty({ example: 'nick123', description: '작성자 닉네임' })
  nickName: string;

  @ApiProperty({ example: '멋진 여행 이야기', description: '포스트 제목' })
  title: string;

  @ApiPropertyOptional({
    description: '포스트 이미지 URL 목록',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  img?: string[];

  @ApiPropertyOptional({
    example: '오늘 여행에서 있었던 일...',
    description: '포스트 내용',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: ['#부산여행', '#바다', '#맛집'],
    description: '해시태그 목록',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  hashtag: string[];
}
export class PostListResponseDto {
  @ApiProperty({ type: [PostItemDto] })
  items: PostItemDto[];

  @ApiProperty({ example: 42 })
  total: number;
}
