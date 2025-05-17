import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNearbyDto {
  @ApiProperty({ description: '검색할 주소' })
  address: string;

  @ApiProperty({ description: '페이지 번호', example: 0 })
  page: number;

  @ApiProperty({ description: '1: 명소,식당,카페, 2: 숙소', example: 1 })
  type: number;

  @ApiProperty({
    description:
      '검색 카테고리 리스트 (예: ["restaurant", "cafe", "tourist_attraction"])',
    isArray: true,
  })
  categories: string[];
}

export class NearbyResponseDto {
  @ApiProperty({ description: '장소 제목', example: '서울 올림픽 공원' })
  title: string;

  @ApiProperty({ description: '장소 카테고리', example: '관광' })
  category: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  imageSrc: string;

  @ApiProperty({ description: '위도', example: 37.55017 })
  lat: number;

  @ApiProperty({ description: '경도', example: 127.08238 })
  lon: number;

  @ApiProperty({
    description: '전화번호',
    example: '02-1234-5678',
    required: false,
  })
  tel: string;
}
