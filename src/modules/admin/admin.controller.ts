import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/adminlogin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly authService: AdminService) {}

  @Post('login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.email, dto.password);
  }
}
