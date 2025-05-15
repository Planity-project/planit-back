import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressChange {
  @ApiProperty({
    description: '주소명 또는 키워드',
    example: '서울특별시 강남구 or 설빙',
  })
  keyword: string;
}

export class PlaceInfoDto {
  @ApiProperty({ description: '장소명', example: '서울타워' })
  title: string;

  @ApiProperty({ description: '위도', example: 37.5512 })
  lat: number;

  @ApiProperty({ description: '경도', example: 126.9882 })
  lon: number;

  @ApiProperty({ description: '주소', example: '서울특별시 용산구 남산동2가' })
  address: string;

  @ApiProperty({
    description: '평점',
    example: 4.5,
    required: false,
    nullable: true,
  })
  rating?: number | null;

  @ApiProperty({ description: '리뷰 수', example: 120 })
  reviewCount: number;

  @ApiProperty({
    description: '운영 중 여부',
    example: true,
    required: false,
    nullable: true,
  })
  openNow?: boolean | null;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://maps.googleapis.com/...',
  })
  image: string;
}
