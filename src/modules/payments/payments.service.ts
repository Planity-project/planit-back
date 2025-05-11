import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { Payment } from './entities/payment.entity';
import axios from 'axios';

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

  async verifyAndSavePayment(
    imp_uid: string,
    albumId: number,
    userId: number,
  ): Promise<Payment> {
    try {
      // 1. 아임포트 API로 결제 검증
      const verificationResponse = await axios.post(
        `${this.portoneApiUrl}/payments/${imp_uid}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const paymentData = verificationResponse.data;
      if (paymentData.success && paymentData.amount > 0) {
        // 2. 결제 성공 시 DB에 저장
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        const album = await this.albumRepository.findOne({
          where: { id: albumId },
        });

        if (!user || !album) {
          throw new Error('사용자 또는 앨범 정보가 존재하지 않습니다.');
        }

        const payment = this.paymentRepository.create({
          price: paymentData.amount,
          method: paymentData.pay_method,
          user,
          album,
          paidAt: new Date(),
        });

        await this.paymentRepository.save(payment);

        return payment;
      } else {
        throw new Error('결제 검증 실패');
      }
    } catch (error) {
      throw new Error('결제 검증 또는 저장 오류: ' + error.message);
    }
  }
}
