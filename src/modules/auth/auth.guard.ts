import { Injectable } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

//로그인 검증

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['access_token'];

    if (!token) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰');
    }

    return true;
  }
}
