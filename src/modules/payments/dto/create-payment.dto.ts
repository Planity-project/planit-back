import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: '결제 금액',
    example: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: '결제 방법',
    example: 'CARD',
    enum: ['CARD', 'BANK', 'PHONE'],
  })
  @IsNotEmpty()
  @IsEnum(['CARD', 'BANK', 'PHONE'])
  method: 'CARD' | 'BANK' | 'PHONE';

  @ApiProperty({
    description: '결제 유저 ID',
    example: 1,
  })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: '결제 앨범 ID',
    example: 1,
  })
  @IsNotEmpty()
  albumId: number;
}
