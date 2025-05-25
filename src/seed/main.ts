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
  await seeder.generatePlaceJson();

  await app.close();
}

bootstrap();
