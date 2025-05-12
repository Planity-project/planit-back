import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { nicknameMaker } from 'util/generator';
import { Admin } from '../admin/entities/admin.entity';

// ✅ 타입 선언 추가
type LoginResponse = {
  accessToken: string;
  user: Record<string, any>;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
  ) {}

  // ✅ 관리자 로그인
  async loginAdmin(email: string, password: string): Promise<LoginResponse> {
    const admin = await this.adminRepository.findOne({ where: { email } });

    if (!admin) {
      throw new Error('존재하지 않는 관리자 계정입니다.');
    }

    if (admin.password !== password) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    const payload = { sub: admin.id, email: admin.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    };
  }

  async findUser(email: string): Promise<User | null> {
    const users = await this.userRepository.findOne({
      where: { email: email },
    });

    return users;
  }

  async create(userData: any): Promise<{ result: boolean }> {
    const user = await this.userRepository.findOne({
      where: { nickname: userData.nickname },
    });
    if (!userData.nickname || user) {
      userData.nickname = nicknameMaker();
    }

    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);

    return { result: true };
  }
}
