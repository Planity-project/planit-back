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

  @Post()
  @ApiResponse({
    status: 201,
    description: '결제 정보',
    type: PaymentDto,
  })
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    const payment = await this.paymentsService.createPayment(createPaymentDto);
    return payment;
  }
}
