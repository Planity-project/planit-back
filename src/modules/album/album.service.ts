import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Album } from './entities/album.entity';
import { AlbumGroup } from './entities/albumGroup.entity';
import { AlbumImage } from './entities/albumImage';
@Injectable()
export class AlbumService {
  constructor(
    @InjectRepository(Album)
    private albumRepo: Repository<Album>,
    private albumImageRepo: Repository<AlbumImage>,
    private albumGroupRepo: Repository<AlbumGroup>,
  ) {}
}
