import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createTestPayment(userId: number) {
    const payment = this.paymentRepository.create({
      userId,
      paymentKey: `test_${Date.now()}`,
      itemName: '테스트 다이아 100개',
      amount: 20000,
      isRefunded: false,
    });

    return this.paymentRepository.save(payment);
  }

  async createPayment(userId: number, paymentKey: string, itemName: string, amount: number) {
    const payment = this.paymentRepository.create({
      userId,
      paymentKey,
      itemName,
      amount,
      isRefunded: false,
    });

    return this.paymentRepository.save(payment);
  }

  async getPaymentHistory(userId: number) {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async refundPayment(paymentKey: string, cancelReason: string, userId: number, cancelAmount: number) {
    try {
      const secretKey = this.configService.get('TOSS_SECRET_KEY');
      if (!secretKey) {
        throw new Error('토스 페이먼츠 시크릿 키가 설정되지 않았습니다.');
      }

      const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
      const basicAuth = Buffer.from(secretKey + ':').toString('base64');
      
      console.log('환불 요청 URL:', url);
      console.log('환불 요청 헤더:', {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      });
      console.log('환불 요청 바디:', {
        cancelReason,
        cancelAmount: cancelAmount,
        refundReceiveAccount: {
          bank: "신한",
          accountNumber: "12345678901234",
          holderName: "홍길동"
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancelReason,
          cancelAmount: cancelAmount,
          refundReceiveAccount: {
            bank: "신한",
            accountNumber: "12345678901234",
            holderName: "홍길동"
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('환불 요청 실패:', errorData);
        throw new Error(errorData.message || '환불 처리 중 오류가 발생했습니다.');
      }

      const refundData = await response.json();
      
      // 환불된 다이아 수량만큼 차감
      const refundedAmount = cancelAmount; // 부분 환불 금액 사용
      const diamondAmount = Math.floor(refundedAmount / 200); // 1다이아당 200원
      
      await this.userService.deductDiamond(userId, diamondAmount);

      // 결제 내역의 환불 상태 업데이트
      await this.paymentRepository.update(
        { paymentKey },
        { isRefunded: true }
      );

      return {
        success: true,
        message: '환불이 완료되었습니다.',
        refundAmount: refundedAmount,
      };
    } catch (error) {
      throw new BadRequestException(error.message || '환불 처리 중 오류가 발생했습니다.');
    }
  }
} 