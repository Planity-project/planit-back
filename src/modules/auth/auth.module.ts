import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User } from '../user/entities/user.entity';
import { UserCuulativeLog } from './loginhistory/entities/userCumulativeLog.entity';
import { UserLoginLog } from './loginhistory/entities/userlogin.entity';

import { GoogleStrategy } from './google.strategy';
import { NaverStrategy } from './naver.strategy';
import { KakaoStrategy } from './kakao.strategy';
import { JwtAuthGuard } from './jwtauth.gurad';
import { Admin } from '../admin/entities/admin.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Admin, UserLoginLog, UserCuulativeLog]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '144h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtModule, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
