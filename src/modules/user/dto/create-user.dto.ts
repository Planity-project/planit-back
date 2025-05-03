import { ApiProperty } from '@nestjs/swagger';

export class updateUserDto {
  @ApiProperty({
    description: 'id',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'nickname',
    example: '닉네임',
  })
  nickname: string;
}
