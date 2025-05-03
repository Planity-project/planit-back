import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '이미지 URL', required: false })
  imgUrl?: string;

  @ApiProperty({ description: '작성자 ID' })
  userId: number;

  @ApiProperty({ description: '장소 ID' })
  locationId: number;
}
