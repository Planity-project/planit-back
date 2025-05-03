import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy as KakaoStrategyOrigin,
  StrategyOption,
} from 'passport-kakao';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserType } from '../user/entities/user.entity';

dotenv.config();

interface KakaoProfile {
  id: number;
  displayName: string;
  emails: { value: string }[];
  _json: { kakao_account: { email: string } };
}

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
    } as StrategyOption);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
    done: VerifyCallback,
  ) {
    const email = profile._json.kakao_account.email;
    const userCreate = { email: email, type: UserType.KAKAO };
    const user = await this.authService.findUser(email);

    if (!user) {
      await this.authService.create(userCreate);
      const userData = await this.authService.findUser(email);
      const payload = {
        id: userData?.id,
        email: userData?.email,
        nickname: userData?.nickname,
      };
      const jwt = this.jwtService.sign(payload);
      done(null, { email: email, token: jwt, result: false });
    } else {
      const payload = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      };
      const jwt = this.jwtService.sign(payload);
      done(null, { email: email, token: jwt, result: true });
    }
  }
}
