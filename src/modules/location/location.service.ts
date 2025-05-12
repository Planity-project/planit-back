import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { LocationsResponseDto } from './dto/locationFindAll.dto';
@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async searchKeword(str: string): Promise<LocationsResponseDto> {
    const data = await this.locationRepository.find();
    const arr: any = data.map((item) => {
      return { name: item.name.includes(str), country: item.country };
    });

    return arr;
  }

  async locationFindAll(): Promise<any[]> {
    const locations = await this.locationRepository.find();
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
