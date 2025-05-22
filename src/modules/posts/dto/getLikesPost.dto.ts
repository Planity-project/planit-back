import { ApiProperty } from '@nestjs/swagger';

export class GetLikePostDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  userId: number;

  @ApiProperty({ example: 2, description: '포스트 ID' })
  postId: number;

  @ApiProperty({ example: '재미진 여수 여행', description: '포스트 제목' })
  title: string;

  @ApiProperty({ example: '진순흠', description: '포스트 작성자 닉네임' })
  nickname: string;
}
