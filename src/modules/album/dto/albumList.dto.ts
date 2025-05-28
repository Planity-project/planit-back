import { ApiProperty } from '@nestjs/swagger';

export class AlbumListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '제주도 여행' })
  album_title: string;

  @ApiProperty({ example: '안상현' })
  leader: string;

  @ApiProperty({ example: true })
  is_paid: boolean;

  @ApiProperty({ example: '2025-05-28T10:13:49.310Z' })
  created_at: Date;
}
