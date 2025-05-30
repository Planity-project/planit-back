import {
  Controller,
  Get,
  Post,
  Body,
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
import { Response, Request } from 'express';
import * as passport from 'passport';
import { REDIRECT_URL } from 'util/api';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserStatus } from 'src/modules/user/entities/user.entity';

import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from './jwtauth.gurad';
interface Userdata {
  email: string;
  token?: string;
  result: boolean;
  redirect?: string | null;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  kakaoAuth(@Req() req: Request, @Res() res: Response) {
    const redirect = req.query.redirect as string;

    passport.authenticate('kakao', {
      state: redirect, // redirect 값을 state로 전달
    })(req, res);
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
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', user.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? 'none' : 'lax',

      secure: isProd,
    });
    if (user.redirect === null) {
      return res.redirect(REDIRECT_URL);
    } else {
      res.redirect(REDIRECT_URL + '/' + user.redirect);
    }
  }

  @Get('google')
  googleAuth(@Req() req: Request, @Res() res: Response) {
    const redirect = req.query.redirect as string;

    // passport.authenticate를 수동 호출
    passport.authenticate('google', {
      scope: ['email', 'profile'],
      state: redirect, // redirect 값을 state로 전달
    })(req, res);
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
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', user.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    console.log(user.redirect, 'redirect');
    if (user.redirect === null) {
      return res.redirect(REDIRECT_URL);
    } else {
      res.redirect(REDIRECT_URL + '/' + user.redirect);
    }
  }

  @Get('naver')
  naverAuth(@Req() req: Request, @Res() res: Response) {
    const redirect = req.query.redirect as string;

    // state에 redirect 값을 전달
    passport.authenticate('naver', {
      state: redirect,
    })(req, res);
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
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', user.token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    console.log(user.redirect, typeof user.redirect, typeof null, 'redirect');
    if (user.redirect === 'null') {
      return res.redirect(REDIRECT_URL);
    } else {
      res.redirect(REDIRECT_URL + '/' + user.redirect);
    }
  }

  @Get('cookieCheck')
  @ApiOperation({ summary: '쿠키를 통한 로그인 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '로그인 응답',
    type: LoginResponseDto,
  })
  async cookieCheck(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(200).json({ result: false });
    }

    try {
      const user: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userData = await this.authService.findVelidate(
        user.email,
        user.provider,
      );

      let isSuspended = false;
      if (
        userData &&
        userData.status === UserStatus.STOP &&
        userData.suspend_until &&
        userData.suspend_until > new Date()
      ) {
        isSuspended = true;
      }
      if (!isSuspended) {
        await this.authService.createLoginLog(user.id);
      }
      return res.status(200).json({
        result: true,
        user: userData,
        isSuspended,
      } as LoginResponseDto);
    } catch (err) {
      return res.status(401).json({
        result: false,
        message: 'token error',
        error: err,
      } as LoginResponseDto);
    }
  }

  @Get('logout')
  async cookieClear(@Res() res: Response, @Req() req: Request) {
    const isProd = process.env.NODE_ENV === 'production';
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(200).json({ result: false });
    }
    const user: any = jwt.verify(token, process.env.JWT_SECRET!);
    await this.authService.deleteLoginLog(user.id);
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    return res.status(200).json({ message: '로그아웃 성공' });
  }

  // ✅ 관리자 로그인
  @Post('admin/login')
  @ApiOperation({
    summary: '관리자 로그인',
    description: '관리자 이메일과 비밀번호를 통한 로그인 처리',
  })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string', format: 'password' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패 또는 관리자 아님' })
  async adminLogin(@Body() body, @Res() res: Response) {
    const { email, password } = body;
    const { accessToken, user } = await this.authService.loginAdmin(
      email,
      password,
    );
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });

    res.json({ user });
  }

  @Get('testLogin')
  async testLogin(@Res() res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    try {
      const token = await this.authService.testLogin();
      res.cookie('accessToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
      });
      return res.json({ result: true, message: '테스트 로그인 성공' });
    } catch (e) {
      console.error(e, '테스트 로그인 실패');
      return res.json({ result: false, message: `${e}` });
    }
  }
}
