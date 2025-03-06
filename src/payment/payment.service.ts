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

  async refundPayment(paymentKey: string, cancelReason: string, userId: number, amount: number) {
    try {
      // 테스트 결제 여부 확인
      const isTestPayment = paymentKey.startsWith('test_') || paymentKey.startsWith('tgen_');

      if (isTestPayment) {
        console.log('테스트 결제 환불 처리:', paymentKey);
        
        // 결제 정보 조회
        const payment = await this.paymentRepository.findOne({ where: { paymentKey } });
        if (!payment) {
          throw new Error('결제 정보를 찾을 수 없습니다.');
        }
        if (payment.isRefunded) {
          throw new Error('이미 환불된 결제입니다.');
        }
        if (payment.amount < amount) {
          throw new Error('환불 금액이 결제 금액보다 클 수 없습니다.');
        }
        
        // 상품명에서 다이아 수량 추출
        const diamondMatch = payment.itemName.match(/(\d+)\s*다이아/);
        if (!diamondMatch) {
          throw new Error('올바르지 않은 상품명입니다.');
        }
        const diamondAmount = parseInt(diamondMatch[1]);
        
        // 다이아 차감
        await this.userService.deductDiamond(userId, diamondAmount);

        // 결제 내역의 환불 상태 업데이트
        await this.paymentRepository.update(
          { paymentKey },
          { isRefunded: true }
        );

        return {
          success: true,
          message: '테스트 결제 환불이 완료되었습니다.',
          refundAmount: amount,
          deductedDiamond: diamondAmount
        };
      }

      // 실제 결제인 경우 토스 페이먼츠 API 호출
      const url = `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`;
      const secretKey = this.configService.get('TOSS_SECRET_KEY');
      
      if (!secretKey) {
        console.error('TOSS_SECRET_KEY가 설정되지 않았습니다.');
        throw new Error('토스 페이먼츠 시크릿 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      }

      // 시크릿 키 마스킹 처리하여 로깅
      const maskedSecretKey = secretKey.substring(0, 4) + '*'.repeat(secretKey.length - 4);
      console.log('토스 페이먼츠 시크릿 키:', maskedSecretKey);
      
      const basicAuth = Buffer.from(secretKey + ':').toString('base64');
      
      console.log('환불 요청 URL:', url);
      console.log('환불 요청 헤더:', {
        'Authorization': `Basic ${basicAuth.substring(0, 10)}...`,
        'Content-Type': 'application/json'
      });
      console.log('환불 요청 바디:', {
        cancelReason,
        amount
      });

      // 결제 정보 조회
      const payment = await this.paymentRepository.findOne({ where: { paymentKey } });
      if (!payment) {
        throw new Error('결제 정보를 찾을 수 없습니다.');
      }
      if (payment.isRefunded) {
        throw new Error('이미 환불된 결제입니다.');
      }
      if (payment.amount < amount) {
        throw new Error('환불 금액이 결제 금액보다 클 수 없습니다.');
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancelReason,
          amount
        })
      });

      console.log('토스 페이먼츠 응답 상태:', response.status);
      const responseText = await response.text();
      console.log('토스 페이먼츠 응답 원본:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('토스 페이먼츠 응답 데이터:', responseData);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        throw new Error('토스 페이먼츠 응답을 처리할 수 없습니다.');
      }

      if (!response.ok) {
        console.error('환불 요청 실패 상세:', responseData);
        throw new Error(responseData.message || '환불 처리 중 오류가 발생했습니다.');
      }

      // 상품명에서 다이아 수량 추출
      const diamondMatch = payment.itemName.match(/(\d+)\s*다이아/);
      if (!diamondMatch) {
        throw new Error('올바르지 않은 상품명입니다.');
      }
      const diamondAmount = parseInt(diamondMatch[1]);
      
      // 다이아 차감
      await this.userService.deductDiamond(userId, diamondAmount);

      // 결제 내역의 환불 상태 업데이트
      await this.paymentRepository.update(
        { paymentKey },
        { isRefunded: true }
      );

      return {
        success: true,
        message: '환불이 완료되었습니다.',
        refundAmount: amount,
        deductedDiamond: diamondAmount
      };
    } catch (error) {
      throw new BadRequestException(error.message || '환불 처리 중 오류가 발생했습니다.');
    }
  }
} 