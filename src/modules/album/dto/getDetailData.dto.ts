import { ApiProperty } from '@nestjs/swagger';

export class AlbumGroupUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  userId: number;

  @ApiProperty({ example: '/defaultImage.png' })
  img: string;

  @ApiProperty({ example: '진순흠' })
  nickname: string;

  @ApiProperty({ example: 'owner' })
  role: string;
}

export class AlbumImageDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '/defaultImage.png' })
  img: string;

  @ApiProperty({ example: 12 })
  likeCnt: number;

  @ApiProperty({ example: 32 })
  commentCnt: number;
}

export class getDetailDataDto {
  @ApiProperty({ example: ['invite.link.com'] })
  link: string[];

  @ApiProperty({ example: '제주도 여행 앨범' })
  title: string;

  @ApiProperty({ example: '/uploads/albums/head/abc123.jpg' })
  titleImg: string;

  @ApiProperty({ type: [AlbumGroupUserDto] })
  group: AlbumGroupUserDto[];

  @ApiProperty({ type: [AlbumImageDto] })
  image: AlbumImageDto[];
}
