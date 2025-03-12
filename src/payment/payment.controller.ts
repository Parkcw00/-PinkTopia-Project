import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UserGuard } from '../user/guards/user-guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('test')
  @UseGuards(UserGuard)
  async createTestPayment(@Request() req) {
    const userId = req.user.id;
    return this.paymentService.createTestPayment(userId);
  }

  @Post('create')
  @UseGuards(UserGuard)
  async createPayment(
    @Body() body: { paymentKey: string; itemName: string; amount: number },
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.paymentService.createPayment(userId, body.paymentKey, body.itemName, body.amount);
  }

  @Get('history')
  @UseGuards(UserGuard)
  async getPaymentHistory(@Request() req) {
    const userId = req.user.id;
    return this.paymentService.getPaymentHistory(userId);
  }

  @Post('refund')
  @UseGuards(UserGuard)
  async refundPayment(
    @Body() body: { 
      paymentKey: string; 
      cancelReason: string; 
      amount: number; 
      isAdminRequest?: boolean 
    },
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.paymentService.refundPayment(
      body.paymentKey, 
      body.cancelReason, 
      userId, 
      body.amount,
      body.isAdminRequest
    );
  }
}