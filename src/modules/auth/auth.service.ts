import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserType } from '../user/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { nicknameMaker } from 'util/nicknameGenerator';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>, // User Repository 주입
  ) {}

  async findUser(email: string): Promise<User | null> {
    const users = await this.userRepository.findOne({
      where: { email: email },
    });

    return users;
  }

  async create(userData: any): Promise<{ result: boolean }> {
    if (!userData.nickname) {
      userData.nickname = nicknameMaker();
    }

    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);

    return { result: true };
  }
}
