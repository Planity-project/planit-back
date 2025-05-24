import { ApiProperty } from '@nestjs/swagger';

class MiniCommentDto {
  @ApiProperty({ example: 3 })
  userId: number;

  @ApiProperty({ example: '/defaultImage.png' })
  profileImg: string | null;

  @ApiProperty({ example: 'nickname' })
  nickname: string;

  @ApiProperty({ example: 'ㅋㅋㅋㅇㅈ' })
  chat: string;
}

class CommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '/defaultImage.png' })
  profileImg: string | null;

  @ApiProperty({ example: 'nickname' })
  nickname: string;

  @ApiProperty({ example: 'ㅋㅋㅋ' })
  chat: string;

  @ApiProperty({ example: 2 })
  likeCnt: number;

  @ApiProperty({ example: true })
  like: boolean;

  @ApiProperty({ type: [MiniCommentDto], required: false })
  miniComment?: MiniCommentDto[];
}

export class AlbumPhotoDetailResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: ['Travel.jpg'], type: [String] })
  titleImg: string[];

  @ApiProperty({ example: 'nickname' })
  user: string;

  @ApiProperty({ example: '/defaultImage.png' })
  userImg: string | null;

  @ApiProperty({
    example: true,
    description: '로그인 유저가 좋아요 눌렀는지 여부',
  })
  like: boolean;

  @ApiProperty({ type: [CommentDto] })
  comment: CommentDto[] | null;

  @ApiProperty({ example: 12 })
  likeCnt: number;
}
