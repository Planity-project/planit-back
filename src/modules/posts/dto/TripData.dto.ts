import { ApiProperty } from '@nestjs/swagger';

export class PostDataDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  titleImg: string;

  @ApiProperty()
  user: string;

  @ApiProperty()
  userImg: string;

  @ApiProperty()
  like: boolean;

  @ApiProperty()
  likeCnt: number;
}

export class TripDayPlaceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  todayOrder: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  lng: number;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewCount: number;
}

export class DayDataDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  postTitle: string;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  like: boolean;

  @ApiProperty()
  likeCnt: number;

  @ApiProperty({ type: [Object] }) // 혹은 이미지 DTO가 있다면 해당 타입 지정
  image: any[];

  @ApiProperty()
  type: boolean;

  // day1, day2, day3... 등의 동적 키는 Swagger에 명시적 정의가 어려우므로 아래와 같이 generic 처리
  [key: string]: any;
}
