import { ApiProperty } from '@nestjs/swagger';
import { PostDataDto } from './TripData.dto';
import { DayDataDto } from './TripData.dto';

export class PostDetailResponseDto {
  @ApiProperty({ type: DayDataDto })
  dayData: DayDataDto;

  @ApiProperty({ type: PostDataDto })
  postData: PostDataDto;
}
