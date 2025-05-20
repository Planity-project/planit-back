import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/entities/comment.entity';
@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepository: Repository<Album>,
    @InjectRepository(AlbumImage)
    private albumImageRepository: Repository<AlbumImage>,
    @InjectRepository(AlbumGroup)
    private albumGroupRepository: Repository<AlbumGroup>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  // 앨범 등록
  async submitAlbum(
    userId: number,
    title: string,
    inviteLink: string,
  ): Promise<{ result: boolean; id: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('해당 유저를 찾을 수 없습니다.');
      }

      const album = this.albumRepository.create({
        user,
        title,
        inviteLink,
      });

      const savedAlbum = await this.albumRepository.save(album);

      const albumGroup = this.albumGroupRepository.create({
        user,
        albums: savedAlbum,
        role: 'OWNER',
        type: 'FREE', // 기본 값이므로 생략 가능하지만 명시 가능
        memberCount: 1,
      });

      await this.albumGroupRepository.save(albumGroup);

      return { result: true, id: savedAlbum.id };
    } catch (error) {
      console.error('앨범 생성 중 에러:', error);
      throw new Error('앨범 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  // 앨범 찾기
  async findAll(): Promise<Album[]> {
    return await this.albumRepository.find();
  }

  // 앨범 디테일
  async findDetailData(albumId: number): Promise<{
    link: string[];
    group: AlbumGroup[];
    image: AlbumImage[];
  }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'images'],
    });

    if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다');

    return {
      link: [album.inviteLink],
      group: album.groups,
      image: album.images,
    };
  }

  // 앨범 그룹 목록
  async getAlbumList() {
    const groups = await this.albumGroupRepository.find({
      relations: ['user', 'albums', 'payments'],
      order: { createdAt: 'DESC' },
    });

    return groups.map((group) => ({
      id: group.id,
      album_title: group.albums?.title,
      leader: group.user?.nickname,
      is_paid: group.type === 'PAID',
      created_at: group.createdAt,
    }));
  }
  // 앨범 권한 확인
  async getAlbumRole(AlbumId: number, userId: number): Promise<string> {
    const albumGroup = await this.albumGroupRepository.findOne({
      where: {
        albums: { id: AlbumId },
        user: { id: userId },
      },
      relations: ['albums', 'user'],
    });

    if (!albumGroup) {
      throw new NotFoundException('해당 유저는 이 앨범에 속해있지 않습니다');
    }

    return albumGroup.role; // 'OWNER' 또는 'MEMBER'
  }

  async findPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit; // 건너뛸 데이터 수

    return await this.albumRepository.find({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
