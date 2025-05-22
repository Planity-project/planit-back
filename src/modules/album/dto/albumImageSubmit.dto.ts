import { ApiProperty } from '@nestjs/swagger';

export class AlbumImageSubmitDto {
  @ApiProperty({ example: 1, description: '앨범 ID' })
  albumId: number;

  @ApiProperty({ example: 3, description: '유저 ID' })
  userId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: '업로드할 이미지 파일들 (최대 5개)',
  })
  files: any;
}
