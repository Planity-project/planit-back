import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.services';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
