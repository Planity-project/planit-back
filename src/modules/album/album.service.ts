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
    private albumRepo: Repository<Album>,
    @InjectRepository(AlbumImage)
    private albumImageRepo: Repository<AlbumImage>,
    @InjectRepository(AlbumGroup)
    private albumGroupRepo: Repository<AlbumGroup>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Comment)
    private commentRepo: Repository<Comment>,
  ) {}

  async submitAlbum(
    userId: number,
    title: string,
  ): Promise<{ result: boolean; id: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('유저를 찾을 수 없습니다');

    const data = this.albumRepo.create({
      user,
      title,
    });

    const savedAlbum = await this.albumRepo.save(data);

    return { result: true, id: savedAlbum.id };
  }

  async findAll(): Promise<Album[]> {
    return await this.albumRepo.find();
  }

  async findDetailData(
    albumId: number,
  ): Promise<{ group: AlbumGroup[]; image: AlbumImage[] }> {
    // album에 연결된 group과 image들을 relations로 가져옴
    const album = await this.albumRepo.findOne({
      where: { id: albumId },
      relations: ['group', 'images'], // 반드시 엔티티에서 설정된 relation 명칭 사용
    });

    if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다');

    return {
      group: album.groups, // 앨범과 연결된 그룹 (단일)
      image: album.images, // 앨범에 속한 이미지들
    };
  }
}
