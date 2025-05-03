import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // 닉네임 업데이트
  async updateUserNickname(
    id: number,
    nickname: string,
  ): Promise<User | { result: boolean; message: string }> {
    const nick = await this.userRepository.findOne({ where: { nickname } });
    if (nick && nick.id !== id) {
      return { result: false, message: '이미 사용중인 닉네임입니다.' };
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException('유저를 찾을 수 없습니다.');
    }

    user.nickname = nickname;
    await this.userRepository.save(user);
    return { result: true, message: '등록 성공' };
  }

  //id로 유저 검색
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
