import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as dotenv from 'dotenv';
import { LoginType } from '../user/entities/user.entity';
import { Request } from 'express';
dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_KEY!,
      clientSecret: process.env.GOOGLE_SECRET_KEY!,
      callbackURL: process.env.GOOGLE_CALLBACK!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const redirect = req.query.state as string;
    const email = profile.emails[0].value;

    const user = await this.authService.findVelidate(email, LoginType.GOOGLE);
    const nickname =
      profile.displayName || profile._json?.name || email?.split('@')[0];

    const userCreate = {
      email: email,
      type: LoginType.GOOGLE,
      nickname: nickname,
    };

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
