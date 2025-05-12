import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { User } from './entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Album } from '../album/entities/album.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AlbumGroup } from '../album/entities/albumGroup.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,

    @InjectRepository(AlbumGroup)
    private readonly albumGroupRepository: Repository<AlbumGroup>,
  ) {}

  // ✅ 유저 전체 목록 조회
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // ✅ 유저 단일 조회
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // ✅ 신고 횟수가 3번 이상인 블랙리스트 회원을 조회
  async getBlacklistedUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { report_count: MoreThanOrEqual(3) },
    });
  }

  // ✅ 앨범 그룹에 속한 회원 조회
  async getUsersInAlbum(albumId: number): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.albumGroups', 'group')
      .where('group.albumId = :albumId', { albumId })
      .distinct(true)
      .getMany();

    return users;
  }

  // ✅ 관리자 유저 정보 업데이트
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  // ✅ 닉네임 업데이트
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

  // ✅ id로 유저 검색
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  // ✅ 유저직접 탈퇴
  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  // ✅ 유저 정보 업데이트
  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  // ✅ 프로필 이미지 변경
  async updateProfileImage(userId: number, filename: string): Promise<void> {
    const user = await this.findOne(userId);
    user.profile_img = filename;
    await this.userRepository.save(user);
  }

  // ✅ 프로필 이미지 삭제
  async deleteProfileImage(userId: number): Promise<void> {
    const user = await this.findOne(userId);
    if (user.profile_img) {
      const filePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        'profiles',
        user.profile_img,
      );
      try {
        await unlink(filePath);
      } catch (err) {
        this.logger.warn(`프로필 이미지 파일 삭제 실패: ${filePath}`);
      }
      user.profile_img = null;
      await this.userRepository.save(user);
    }
  }

  // ✅ 관리자에 의한 유저 완전 삭제
  async deleteUsersByAdmin(userIds: number[]): Promise<void> {
    for (const userId of userIds) {
      await this.deleteUserAndRelatedData(userId);
    }
  }

  // ✅ 유저 및 관련 데이터 삭제
  private async deleteUserAndRelatedData(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 결제 정보 삭제
    await this.paymentRepository.delete({ user: { id: userId } });

    // 앨범 삭제
    await this.albumRepository.delete({ user: { id: userId } });

    // 유저 삭제
    const deleteResult = await this.userRepository.delete(userId);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
