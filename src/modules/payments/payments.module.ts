import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { Album } from '../album/entities/album.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Album])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
