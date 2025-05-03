import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverStrategyOrigin } from 'passport-naver';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { UserType } from '../user/entities/user.entity';

dotenv.config();

interface NaverProfile {
  id: string;
  emails: string[];
  _json: { email: string };
}

type VerifyCallback = (error: any, user?: any, info?: any) => void;

@Injectable()
export class NaverStrategy extends PassportStrategy(
  NaverStrategyOrigin,
  'naver',
) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.NAVER_KEY!,
      clientSecret: process.env.NAVER_SECRET_KEY!,
      callbackURL: process.env.NAVER_CALLBACK!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: NaverProfile,
    done: VerifyCallback,
  ) {
    const email = profile._json.email;
    const userCreate = { email: email, type: UserType.NAVER };
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
