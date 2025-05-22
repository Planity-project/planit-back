import { ApiProperty } from '@nestjs/swagger';

export class TripFindDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  // 필요하면 user 정보도 추가 가능
  @ApiProperty({ required: false })
  userId?: number; // user 엔티티가 별도라면 user.id만 포함할 수도 있음
}
