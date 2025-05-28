import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';

export class PaymentDto {
  @ApiProperty({
    description: '결제 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '결제 금액',
    example: 10000,
  })
  price: number;

  @ApiProperty({
    description: '결제 방법',
    example: 'CARD',
    enum: ['CARD', 'BANK', 'PHONE'],
  })
  method: 'CARD' | 'BANK' | 'PHONE';

  @ApiProperty({
    description: '결제 일시',
    example: '2025-05-10T10:00:00Z',
  })
  paidAt: Date;

  @ApiProperty({
    description: '결제 유저 정보',
    type: () => User,
  })
  user: User;

  @ApiProperty({
    description: '결제 앨범 정보',
    type: () => Album,
  })
  album: Album;

  @ApiProperty({
    description: '결제 고유번호',
  })
  impUid: string;
}
