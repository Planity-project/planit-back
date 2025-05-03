import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { User } from '../user/entities/user.entity';

import { GoogleStrategy } from './google.strategy';
import { NaverStrategy } from './naver.strategy';
import { KakaoStrategy } from './kakao.strategy';
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, NaverStrategy, KakaoStrategy],
  exports: [AuthService],
})
export class AuthModule {}
