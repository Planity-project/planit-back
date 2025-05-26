import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';
import { LoginHistoryService } from './loginhistory.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginLog])],
  providers: [LoginHistoryService],
  exports: [LoginHistoryService],
})
export class LoginHistoryModule {}
