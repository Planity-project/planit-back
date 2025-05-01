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
interface Userdata {
  email: string;
  token?: string;
  result: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('kakao')
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    return;
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
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

  @ApiTags('google')
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/callback')
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

  @ApiTags('naver')
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    return;
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
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
  async cookeCheck(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.access_token;

    if (token) {
      return res.status(200).json({ result: true });
    } else {
      return res.status(200).json({ result: false });
    }
  }
}
