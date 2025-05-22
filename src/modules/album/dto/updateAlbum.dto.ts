import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlbumDto {
  @ApiProperty()
  albumId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ required: false })
  title?: string;
}
