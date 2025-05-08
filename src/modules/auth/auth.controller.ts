import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';

import { REDIRECT_URL } from 'util/api';
import { SERVER_DOMAIN } from 'util/api';

import * as jwt from 'jsonwebtoken';
interface Userdata {
  email: string;
  token?: string;
  result: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({
    summary: '카카오 OAuth 콜백',
    description:
      '카카오 OAuth 로그인 콜백을 처리하고, 인증된 사용자의 엑세스 토큰을 쿠키 발급.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 후 홈 페이지로 리다이렉트.',
  })
  async kakaoRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Userdata;

    res.cookie('access_token', user.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
      secure: false,
    });
    return res.redirect(REDIRECT_URL);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @ApiOperation({
    summary: '구글 OAuth 콜백',
    description:
      '구글 OAuth 로그인 콜백을 처리하고, 인증된 사용자의 엑세스 토큰을 쿠키 발급.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 후 홈 페이지로 리다이렉트.',
  })
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Userdata;

    res.cookie('access_token', user.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
      secure: false,
    });
    return res.redirect(REDIRECT_URL);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    return;
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({
    summary: '네이버 OAuth 콜백',
    description:
      '네이버 OAuth 로그인 콜백을 처리하고, 인증된 사용자의 엑세스 토큰을 쿠키 발급.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 후 홈 페이지로 리다이렉트.',
  })
  async naverRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as Userdata;

    res.cookie('access_token', user.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
      secure: false,
    });
    return res.redirect(REDIRECT_URL);
  }

  @Get('cookieCheck')
  async cookieCheck(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.access_token;
    console.log(token, 'token 확인');
    if (!token) {
      return res.status(200).json({ result: false });
    }

    try {
      const user: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userData = await this.authService.findUser(user.email);
      return res.status(200).json({
        result: true,
        user: userData,
      });
    } catch (err) {
      return res
        .status(401)
        .json({ result: false, message: 'token error', error: err });
    }
  }

  @Get('logout')
  async cookieClear(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });
    return res.status(200).json({ message: '로그아웃 성공' });
  }
}
