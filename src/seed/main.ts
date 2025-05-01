import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.services';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.select(SeederModule).get(SeederService, { strict: true });

  await seeder.runSeed();
  await app.close();
}

bootstrap();
