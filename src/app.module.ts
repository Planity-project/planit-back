import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SeederModule } from './seed/seeder.module';
import { MapModule } from './modules/map/map.module';
import { MapService } from './modules/map/map.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './modules/scheduler/scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      // rootPath: join(__dirname, '..', 'uploads'), // 실제 파일 경로
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads', // 요청 경로 (예: http://localhost:5001/uploads/파일명)
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 60 * 24,
    }),
    DatabaseModule,
    SeederModule,
    MapModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
