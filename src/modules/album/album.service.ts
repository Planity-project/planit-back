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
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('해당 유저를 찾을 수 없습니다.');
      }

      const album = this.albumRepo.create({
        user,
        title,
      });

      const savedAlbum = await this.albumRepo.save(album);

      return { result: true, id: savedAlbum.id };
    } catch (error) {
      console.error('앨범 생성 중 에러:', error);
      throw new Error('앨범 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  async findAll(): Promise<Album[]> {
    return await this.albumRepo.find();
  }

  async findDetailData(albumId: number): Promise<{
    group: AlbumGroup[];
    image: AlbumImage[];
    comment?: Comment[] | null;
  }> {
    const album = await this.albumRepo.findOne({
      where: { id: albumId },
      relations: ['group', 'images', 'comment'],
    });

    if (!album) throw new NotFoundException('앨범을 찾을 수 없습니다');

    return {
      group: album.groups,
      image: album.images,
      comment: album.comment,
    };
  }
}
