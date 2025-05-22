import { ApiProperty } from '@nestjs/swagger';

export class PlaceDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lon: number;

  @ApiProperty()
  category: string;

  @ApiProperty({ required: false })
  tel?: string;

  @ApiProperty({ required: false })
  imageSrc?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty({ required: false })
  reviewCount?: number;

  @ApiProperty({ required: false })
  minutes?: number;
}

class StayDto {
  @ApiProperty()
  date: string;

  @ApiProperty({ nullable: true, type: PlaceDto })
  place: PlaceDto | null;
}

class TimeDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  start: object; // 상세 타입 있으면 수정

  @ApiProperty()
  end: object;
}

export class GenerateDateDto {
  @ApiProperty({ type: [PlaceDto] })
  dataPlace: PlaceDto[];

  @ApiProperty({ type: [StayDto] })
  dataStay: StayDto[];

  @ApiProperty({ type: [TimeDto] })
  dataTime: TimeDto[];

  @ApiProperty()
  location: string;

  @ApiProperty()
  userId: number;
}
