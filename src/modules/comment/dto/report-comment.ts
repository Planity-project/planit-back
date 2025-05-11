import { IsInt, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportCommentDto {
  @ApiProperty({ example: 42, description: '신고한 사용자 ID' })
  @IsInt()
  userId: number;

  @ApiProperty({ example: '욕설이 있습니다.', description: '신고 사유' })
  @IsString()
  @MinLength(3)
  reason: string;
}
