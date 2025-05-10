import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { Payment } from './entities/payment.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,
  ) {}

  private readonly portoneApiUrl = 'https://api.portone.kr/v1'; // PortOne API URL
  private readonly apiKey = process.env.PORTONE_REST_API_Key; // API Key
  private readonly apiSecret = process.env.PORTONE_REST_API_Secret; // API Secret

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { price, method, userId, albumId } = createPaymentDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('사용자가 존재하지 않습니다.');
    }

    const album = await this.albumRepository.findOne({
      where: { id: albumId },
    });
    if (!album) {
      throw new Error('앨범이 존재하지 않습니다.');
    }

    const payment = this.paymentRepository.create({
      price,
      method,
      user,
      album,
      paidAt: new Date(),
    });

    await this.paymentRepository.save(payment);

    return payment;
  }
}
