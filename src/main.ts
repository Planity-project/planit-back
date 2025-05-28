import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { webcrypto } from 'crypto';
import { SchedulerService } from './modules/scheduler/scheduler.service';
import * as express from 'express';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as unknown as Crypto;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ 여기 추가: 요청 본문 최대 크기 제한 설정
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  await app.get(SchedulerService).handleTripSharePrompts();
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Planit API')
    .setDescription('플래닛 여행 프로젝트 API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:4000'], // 모든 origin 허용하되 credentials까지 허용됨
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
