import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({
    description: '회원 ID',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  id: number;

  @ApiPropertyOptional({
    description: '닉네임',
    example: '닉네임',
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsUrl()
  profile_img?: string;

  @ApiPropertyOptional({
    description: '회원 상태',
    example: 'active',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: '신고 횟수',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  report_count?: number;
}
