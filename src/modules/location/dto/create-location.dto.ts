import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LocationDto {
  @ApiProperty({
    description: '위치 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '위치 이름',
    example: '서울',
  })
  name: string;

  @ApiProperty({
    description: '위치의 국가',
    example: '대한민국',
    default: '대한민국',
  })
  country: string;

  @ApiProperty({
    description: '위도',
    example: 37.252,
  })
  lat: number;

  @ApiProperty({
    description: '경도',
    example: 36.252,
  })
  lng: number;
}

export class LocationsResponseDto {
  @ApiProperty({
    description: '위치 목록',
    type: [LocationDto], // 배열
    example: [
      {
        id: 1,
        name: '서울',
        country: '대한민국',
        lat: 37.252,
        lng: 36.252,
      },
      {
        id: 2,
        name: '부산',
        country: '대한민국',
        lat: 37.252,
        lng: 36.252,
      },
    ],
  })
  locations: LocationDto[];
}
