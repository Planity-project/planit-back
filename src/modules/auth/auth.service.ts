import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { LoginType } from '../user/entities/user.entity';

import { JwtService } from '@nestjs/jwt';
import { nicknameMaker } from 'util/generator';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

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
    if (!userData.nickname && user) {
      userData.nickname = nicknameMaker();
    }

    const newUser = this.userRepository.create(userData);
    await this.userRepository.save(newUser);

    return { result: true };
  }
}
