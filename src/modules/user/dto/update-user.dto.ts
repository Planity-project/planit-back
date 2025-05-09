import { IsOptional, IsEnum, IsString } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
