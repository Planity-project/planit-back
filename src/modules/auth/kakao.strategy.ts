import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as KakaoStrategyOrigin,
  StrategyOption,
} from 'passport-kakao';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { LoginType } from '../user/entities/user.entity';
import { Request } from 'express';
dotenv.config();

type VerifyCallback = (error: any, user?: any, info?: any) => void;

@Injectable()
export class KakaoStrategy extends PassportStrategy(
  KakaoStrategyOrigin,
  'kakao',
) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.KAKAO_KEY!,
      clientSecret: process.env.KAKAO_SECRET_KEY!,
      callbackURL: process.env.KAKAO_CALLBACK!,
      scope: ['account_email'],
      passReqToCallback: true,
    } as StrategyOption);
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const redirect = req.query.state as string;
    const kakaoData = profile._json || JSON.parse(profile._raw || '{}');
    const email = profile._json.kakao_account.email;
    const user = await this.authService.findVelidate(email, LoginType.KAKAO);
    const nickname = kakaoData?.properties?.nickname;
    const userCreate = {
      email: email,
      type: LoginType.KAKAO,
      nickname: nickname,
    };

    if (!user) {
      await this.authService.create(userCreate);
      const userData = await this.authService.findVelidate(
        email,
        LoginType.KAKAO,
      );
      const payload = {
        id: userData?.id,
        email: userData?.email,
        nickname: userData?.nickname,
        provider: userData?.type,
      };
      const jwt = this.jwtService.sign(payload);
      done(null, {
        email: email,
        token: jwt,
        result: false,
        redirect: redirect ? redirect : null,
      });
    } else {
      const payload = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        provider: user.type,
      };
      const jwt = this.jwtService.sign(payload);
      done(null, {
        email: email,
        token: jwt,
        result: true,
        redirect: redirect ? redirect : null,
      });
    }
  }
}
