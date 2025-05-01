import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from 'src/modules/admin/entities/admin.entity';
@Injectable()
export class SeederService {
  constructor(@InjectRepository(Admin) private adminRepo: Repository<Admin>) {}

  async runSeed() {
    const user = this.adminRepo.create({
      email: 'admin@abc.abc',
      password: '#a1234567',
    });

    await this.adminRepo.save(user);
  }
}
