import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: 'http://localhost:3000', // 모든 origin 허용하되 credentials까지 허용됨
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();

//커밋 메세지
// feat - 추가
// fix - 수정
