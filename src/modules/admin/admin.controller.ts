import { Body, Controller, Post, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/adminlogin.dto';
import { Response } from 'express';
import { SERVER_DOMAIN } from 'util/api';

@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AdminService) {}

  // 로그인
  @Post('login')
  async adminLogin(@Body() dto: AdminLoginDto, @Res() res: Response) {
    const token = await this.authService.adminLogin(dto.email, dto.password);

    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1시간
      sameSite: 'lax',
      secure: false, // HTTPS 환경에서는 true
    });

    return res.status(200).json({ message: '로그인 성공' });
  }

  //

  //

  //

  //
}
