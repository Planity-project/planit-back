import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { LocationsResponseDto } from './dto/create-location.dto';
@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async searchKeword(str: string): Promise<LocationsResponseDto> {
    const data = await this.locationRepo.find();
    const arr: any = data.map((item) => {
      return { name: item.name.includes(str), country: item.country };
    });

    return arr;
  }

  async locationFindAll(): Promise<any[]> {
    const locations = await this.locationRepo.find();
    const plainLocations = locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      country: loc.country,
      lat: loc.lat,
      lng: loc.lng,
    }));
    return plainLocations;
  }
}
