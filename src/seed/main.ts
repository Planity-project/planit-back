import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';
import { SchedulerService } from 'src/modules/scheduler/scheduler.service';
import * as crypto from 'crypto';
(global as any).crypto = crypto;

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.select(SeederModule).get(SeederService, { strict: true });

  await seeder.runSeed();
  // await seeder.generatePlaceJson();
  // 이걸 사용하고 run seed하면 데이터 재생성, 사용 안하면 데이터 재생성 x

  await app.close();
}

bootstrap();
