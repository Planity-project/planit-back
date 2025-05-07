import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Location } from 'src/modules/location/entities/location.entity';

const arr = [
  { country: '대한민국', name: '제주', lat: 33.4996, lng: 126.5312 },
  { country: '대한민국', name: '부산', lat: 35.1796, lng: 129.0756 },
  { country: '대한민국', name: '서울', lat: 37.5665, lng: 126.978 },
  { country: '대한민국', name: '경주', lat: 35.8562, lng: 129.2247 },
  { country: '대한민국', name: '강릉', lat: 37.7519, lng: 128.8761 },
  { country: '대한민국', name: '여수', lat: 34.7604, lng: 127.6622 },
  { country: '대한민국', name: '거제통영', lat: 34.88, lng: 128.621 },
  { country: '대한민국', name: '전주', lat: 35.8242, lng: 127.148 },
  { country: '대한민국', name: '남원', lat: 35.4167, lng: 127.39 },
  { country: '대한민국', name: '포항', lat: 36.019, lng: 129.3435 },
  { country: '대한민국', name: '대전', lat: 36.3504, lng: 127.3845 },
  { country: '대한민국', name: '인천', lat: 37.4563, lng: 126.7052 },
  { country: '대한민국', name: '춘천', lat: 37.8813, lng: 127.7298 },
  { country: '대한민국', name: '군산', lat: 35.9677, lng: 126.7365 },
  { country: '대한민국', name: '목포', lat: 34.8118, lng: 126.3922 },
  { country: '대한민국', name: '안동', lat: 36.5684, lng: 128.7294 },
  { country: '대한민국', name: '울릉도', lat: 37.4846, lng: 130.898 },
  { country: '대한민국', name: '가평', lat: 37.8315, lng: 127.5097 },
  { country: '대한민국', name: '제천', lat: 37.1326, lng: 128.19 },
  { country: '대한민국', name: '수원', lat: 37.2636, lng: 127.0286 },
  { country: '대한민국', name: '영월', lat: 37.1835, lng: 128.4611 },
];

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
  ) {}

  async runSeed() {
    const user = this.adminRepo.create({
      email: 'admin@abc.abc',
      password: '#a1234567',
    });
    await this.adminRepo.save(user);

    const locations = arr.map((item) => {
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
