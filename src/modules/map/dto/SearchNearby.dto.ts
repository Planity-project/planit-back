import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNearbyDto {
  @ApiProperty({ description: '검색할 주소', example: '서울' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: '페이지 번호', example: '1' })
  @IsOptional()
  @IsNumberString()
  page: string;

  @ApiPropertyOptional({ description: '1: 관광, 2: 숙박', example: '1' })
  @IsOptional()
  @IsNumberString()
  type: number;
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
