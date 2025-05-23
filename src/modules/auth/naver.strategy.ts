import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverStrategyOrigin } from 'passport-naver';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { LoginType } from '../user/entities/user.entity';
import { Request } from 'express';
dotenv.config();

interface NaverProfile {
  id: string;
  emails: string[];

  _json: { email: string; nickname: string };
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
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: NaverProfile,
    done: VerifyCallback,
  ) {
    const redirect = req.query.state as string;
    const nickname = profile._json.nickname;
    const email = profile._json.email;
    const userCreate = {
      email: email,
      type: LoginType.NAVER,
      nickname: nickname,
    };
    const user = await this.authService.findUser(email);

    console.log(userCreate);
    if (!user) {
      await this.authService.create(userCreate);
      const userData = await this.authService.findUser(email);
      const payload = {
        id: userData?.id,
        email: userData?.email,
        nickname: userData?.nickname,
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
