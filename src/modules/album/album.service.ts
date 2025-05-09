import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
import { User } from '../user/entities/user.entity';
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
}
