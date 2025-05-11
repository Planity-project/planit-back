import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDto } from './dto/payment.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  @ApiResponse({
    status: 201,
    description: '결제 검증 및 저장 완료',
  })
  async verifyPayment(
    @Body() body: { imp_uid: string; albumId: number; userId: number },
  ) {
    const { imp_uid, albumId, userId } = body;
    // imp_uid로 결제 검증 후, 결제 정보를 저장
    return this.paymentsService.verifyAndSavePayment(imp_uid, albumId, userId);
  }
}
