import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { nicknameMaker } from 'util/generator';
import { Admin } from '../admin/entities/admin.entity';
import { LoginType } from '../user/entities/user.entity';
import { UserStatus } from '../user/entities/user.entity';
import { UserLoginLog } from './loginhistory/entities/userlogin.entity';

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
    @InjectRepository(UserLoginLog)
    private userLogRepository: Repository<UserLoginLog>,
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

  async validateLogin(user: User): Promise<LoginResponse> {
    const now = new Date();

    if (user.status === UserStatus.STOP) {
      if (user.suspend_until && now > user.suspend_until) {
        // 정지 기간 지남 → 자동 복구 처리
        user.status = UserStatus.ACTIVE;
        user.suspend_until = undefined;
        user.suspend_reason = undefined;
        user.report_count = 0; // 필요 시 신고 횟수 초기화도 가능

        await this.userRepository.save(user);
      } else {
        // 아직 정지 기간임
        const until = user.suspend_until
          ? user.suspend_until.toISOString()
          : '기간 미정';
        throw new Error(
          `계정이 정지된 상태입니다. 정지 해제일: ${until}, 사유: ${user.suspend_reason ?? '없음'}`,
        );
      }
    }

    // 정상 계정인 경우 토큰 발급
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, user };
  }

  async findVelidate(email: string, Provider: LoginType): Promise<User | null> {
    const users = await this.userRepository.findOne({
      where: { email: email, type: Provider },
    });

    return users;
  }

  async createLoginLog(userId: number): Promise<void> {
    const user: any = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      console.error('유저가 존재하지 않습니다' + 'createLoginLog');
      return;
    }
    const check: any = await this.userLogRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!check) {
      const uData = await this.userLogRepository.create(user);
      await this.userLogRepository.save(uData);
    }
  }

  async deleteLoginLog(userId: number): Promise<void> {
    await this.userLogRepository.delete({ user: { id: userId } });
  }
}
