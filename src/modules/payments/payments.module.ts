import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { Album } from '../album/entities/album.entity';
import { AlbumGroup } from '../album/entities/albumGroup.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, Album, AlbumGroup])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
