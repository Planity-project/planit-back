import {
  IsNotEmpty,
  IsString,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchInputNearbyDto {
  @ApiProperty({ description: '검색할 주소', example: '서울' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: '페이지 번호', example: '1' })
  @IsOptional()
  @IsNumberString()
  page: string;

  @ApiPropertyOptional({ description: '키워드', example: '맛집' })
  @IsOptional()
  @IsString()
  str: string;

  @ApiPropertyOptional({ description: '1: 관광, 2: 숙박', example: '1' })
  @IsOptional()
  @IsNumberString()
  type: number;
}
