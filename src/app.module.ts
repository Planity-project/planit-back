import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { SeederModule } from './seed/seeder.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 실제 파일 경로
      serveRoot: '/uploads', // 요청 경로 (예: http://localhost:5001/uploads/파일명)
    }),
    DatabaseModule,
    SeederModule,
    GeminiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
