import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UserRoleDto {
  @ApiProperty({ example: 1, description: '앨범 ID' })
  @IsNumber()
  albumId: number;

  @ApiProperty({ example: 10, description: '유저 ID' })
  @IsNumber()
  userId: number;
}
