import { ApiProperty } from '@nestjs/swagger';
import { Album } from '../entities/album.entity'; // 실제 Album 엔티티 경로로 변경

export class findAllAlbumDto {
  @ApiProperty({ type: () => [Album] })
  items: Album[];

  @ApiProperty({ example: 42, description: '총 앨범 개수' })
  total: number;
}
