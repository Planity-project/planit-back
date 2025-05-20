import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCommentDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '삭제할 댓글 ID 목록',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
