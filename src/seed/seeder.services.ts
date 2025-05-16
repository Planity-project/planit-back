import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Location } from 'src/modules/location/entities/location.entity';

export const locationArr = [
  {
    country: '대한민국',
    name: '제주',
    lat: 33.5097,
    lng: 126.5219,
    radius: 25000,
  },
  {
    country: '대한민국',
    name: '부산',
    lat: 35.1667,
    lng: 129.0667,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '서울',
    lat: 37.5326,
    lng: 127.0246,
    radius: 7000,
  },
  {
    country: '대한민국',
    name: '경주',
    lat: 35.8354,
    lng: 129.2639,
    radius: 12000,
  },
  { country: '대한민국', name: '강릉', lat: 37.75, lng: 128.9, radius: 12000 },
  {
    country: '대한민국',
    name: '여수',
    lat: 34.7628,
    lng: 127.6653,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '거제',
    lat: 34.8804,
    lng: 128.6217,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '통영',
    lat: 34.8545,
    lng: 128.4331,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '전주',
    lat: 35.8219,
    lng: 127.1489,
    radius: 10000,
  },
  { country: '대한민국', name: '남원', lat: 35.41, lng: 127.39, radius: 10000 },
  {
    country: '대한민국',
    name: '포항',
    lat: 36.0322,
    lng: 129.365,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '대전',
    lat: 36.351,
    lng: 127.385,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '인천',
    lat: 37.483,
    lng: 126.633,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '춘천',
    lat: 37.867,
    lng: 127.733,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '군산',
    lat: 35.9833,
    lng: 126.7167,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '목포',
    lat: 34.7667,
    lng: 126.35,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '안동',
    lat: 36.5667,
    lng: 128.7167,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '가평',
    lat: 37.8315,
    lng: 127.5097,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '제천',
    lat: 37.1333,
    lng: 128.2,
    radius: 10000,
  },
  {
    country: '대한민국',
    name: '수원',
    lat: 37.2636,
    lng: 127.0286,
    radius: 8000,
  },
  {
    country: '대한민국',
    name: '영월',
    lat: 37.1835,
    lng: 128.4611,
    radius: 10000,
  },
];

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
  ) {}

  async runSeed() {
    await this.adminRepo.delete({});
    await this.locationRepo.delete({});

    const user = this.adminRepo.create({
      email: 'admin@abc.abc',
      password: '#a1234567',
    });
    await this.adminRepo.save(user);

    const locations = locationArr.map((item) => {
      const location = this.locationRepo.create({
        country: item.country,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
      });
      return location;
    });

    await this.locationRepo.save(locations);
  }
}
