import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDto } from './dto/payment.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { REDIRECT_URL } from 'util/api';
@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  @ApiResponse({
    status: 201,
    description: '결제 검증 및 저장 완료',
  })
  async verifyPayment(@Body() body: any, @Res() res: Response) {
    const { paymentId, albumId, userId, txId, type } = body;
    const data = await this.paymentsService.verifyAndSavePayment(
      paymentId,
      albumId,
      userId,
      txId,
    );

    if (type === 'mobile') {
      //  모바일 환경일 경우 리다이렉트
      return res.redirect(`${REDIRECT_URL}`);
    }

    //  데스크톱 환경일 경우 정상 응답
    return res.status(200).json({ message: '결제 검증 및 저장 완료', data });
  }
}
