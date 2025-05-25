import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitAlbumDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: '여행 앨범 제목', description: '앨범 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '대표 이미지', description: '대표 이미지' })
  @IsString()
  @IsNotEmpty()
  titleImg: string | null;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: '앨범 대표 이미지 URL',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class SubmitAlbumResponseDto {
  @ApiProperty({ example: true })
  result: boolean;

  @ApiProperty({ example: 1 })
  id: number;
}
