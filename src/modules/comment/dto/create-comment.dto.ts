import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: '재밌어요!', description: '댓글 내용' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({
    example: 10,
    description: '앨범 이미지 ID (이미지 공유 단톡방)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  albumImageId?: number;

  @ApiProperty({
    example: 3,
    description: '부모 댓글 ID (대댓글일 경우)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
