import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Location } from 'src/modules/location/entities/location.entity';

const arr = [
  { country: '대한민국', name: '제주' },
  { country: '대한민국', name: '부산' },
  { country: '대한민국', name: '서울' },
  { country: '대한민국', name: '경주' },
  { country: '대한민국', name: '강릉' },
  { country: '대한민국', name: '여수' },
  { country: '대한민국', name: '거제통영' },
  { country: '대한민국', name: '전주' },
  { country: '대한민국', name: '남원' },
  { country: '대한민국', name: '포항' },
  { country: '대한민국', name: '대전' },
  { country: '대한민국', name: '인천' },
  { country: '대한민국', name: '춘천' },
  { country: '대한민국', name: '군산' },
  { country: '대한민국', name: '목포' },
  { country: '대한민국', name: '안동' },
  { country: '대한민국', name: '울릉도' },
  { country: '대한민국', name: '가평' },
  { country: '대한민국', name: '제천' },
  { country: '대한민국', name: '수원' },
  { country: '대한민국', name: '영월' },
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
      });
      return location;
    });

    await this.locationRepo.save(locations);
  }
}
