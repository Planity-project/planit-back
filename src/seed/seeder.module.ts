import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { DatabaseModule } from '../database/database.module';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Location } from 'src/modules/location/entities/location.entity';
@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Admin, Location])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
