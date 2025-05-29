import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { Album } from 'src/modules/album/entities/album.entity';
import { AlbumGroup } from '../album/entities/albumGroup.entity';
import { Payment } from './entities/payment.entity';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Album)
    private readonly albumRepository: Repository<Album>,

    @InjectRepository(AlbumGroup)
    private readonly albumGroupRepository: Repository<AlbumGroup>,
  ) {}

  private readonly portoneApiUrl = 'https://api.portone.io/payments/';
  private readonly apiKey = process.env.PORTONE_REST_API_Key;
  private readonly apiSecret = process.env.PORTONE_REST_API_Secret;

  async verifyAndSavePayment(
    paymentId: string,
    albumId: number,
    userId: number,
    txId: string,
  ): Promise<Payment | null> {
    try {
      if (!this.apiSecret) {
        throw new Error('PORTONE_REST_API_Secret error.');
      }

      const options = {
        method: 'GET',
        url: `${this.portoneApiUrl}${paymentId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `PortOne ${this.apiSecret}`,
        },
      };

      const { data }: any = await axios.request(options);

      // 2. 결제 상태 검증
      if (data.status !== 'PAID') {
        throw new HttpException(
          '결제가 완료되지 않았습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.findOneBy({ id: userId });
      const album = await this.albumRepository.findOne({
        where: { id: albumId },
        relations: ['groups'],
      });

      const albumGroup = await this.albumGroupRepository.findOne({
        where: { user: { id: userId }, albums: { id: albumId } },
        relations: ['user', 'albums'],
      });

      if (!user || !album || !albumGroup) {
        throw new HttpException(
          '대상 정보가 존재하지 않습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      album.type = 'PAID';
      albumGroup.type = 'PAID';
      await this.albumRepository.save(album);
      await this.albumGroupRepository.save(albumGroup);

      const payment = this.paymentRepository.create({
        method: data.method?.provider,
        price: data.amount?.total,
        user,
        album,
        albumGroup,
      });
      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      throw new HttpException(
        '결제 처리 중 오류 발생',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 유저 결제 정보
  async getPaymentsByUserId(userId: string) {
    return this.paymentRepository.find({
      where: { user: { id: Number(userId) } },
      relations: ['album'],
      order: { paidAt: 'DESC' },
    });
  }
}
