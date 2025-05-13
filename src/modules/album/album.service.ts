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
  ): Promise<{ result: boolean; id: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('해당 유저를 찾을 수 없습니다.');
      }

      const album = this.albumRepository.create({
        user,
        title,
      });

      const savedAlbum = await this.albumRepository.save(album);

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
    group: AlbumGroup[];
    image: AlbumImage[];
    comment?: Comment[] | null;
  }> {
    const album = await this.albumRepository.findOne({
      where: { id: albumId },
      relations: ['groups', 'images', 'comment'],
    });

    if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다');

    return {
      group: album.groups,
      image: album.images,
      comment: album.comment,
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
}
