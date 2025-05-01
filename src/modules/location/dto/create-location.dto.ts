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
}

export class LocationsResponseDto {
  @ApiProperty({
    description: '위치 목록',
    type: [LocationDto], // 배열로 반환
    example: [
      {
        id: 1,
        name: '서울',
        country: '대한민국',
      },
      {
        id: 2,
        name: '부산',
        country: '대한민국',
      },
    ],
  })
  locations: LocationDto[];
}
