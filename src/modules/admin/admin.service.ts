import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { SERVER_DOMAIN } from 'util/api';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private jwtService: JwtService,
  ) {}
  async adminLogin(email: string, password: string): Promise<string> {
    const admin = await this.adminRepo.findOne({ where: { email } });

    if (!admin || admin.password !== password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const payload = { sub: admin.id, email: admin.email };
    const accessToken = this.jwtService.sign(payload);

    return accessToken;
  }
}
