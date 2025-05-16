import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { CacheService } from 'src/cache/cache.service';

@Module({
  controllers: [MapController],
  providers: [MapService, CacheService],
})
export class MapModule {}
