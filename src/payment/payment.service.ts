import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { MoreThan } from 'typeorm';

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
    const payments = await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 유저 정보 조회
    const user = await this.userService.findById(userId);

    // 각 결제 항목에 대해 사용된 다이아몬드 수량 계산
    const enhancedPayments = await Promise.all(payments.map(async (payment) => {
      const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
      const usedDiamonds = await this.getUsedDiamonds(userId, payment);
      
      return {
        ...payment,
        usedDiamonds,
        remainingDiamonds: purchasedDiamonds - usedDiamonds
      };
    }));

    return enhancedPayments;
  }

  // 다이아몬드 사용량 확인 메서드
  private async getUsedDiamonds(userId: number, payment: Payment): Promise<number> {
    try {
      // 1. 환불하려는 결제의 다이아 수량 확인
      const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
      
      if (purchasedDiamonds <= 0) {
        return 0; 
      }

      // 2. 사용자 현재 다이아 수량 확인
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 3. 사용자의 모든 환불되지 않은 결제 내역 조회
      const allPayments = await this.paymentRepository.find({
        where: {
          userId,
          isRefunded: false
        },
        order: {
          createdAt: 'ASC' // 시간순 정렬
        }
      });

      // 4. 총 구매한 다이아 수량 계산
      let totalPurchasedDiamonds = 0;
      for (const p of allPayments) {
        const diamondAmount = this.extractDiamondAmount(p.itemName);
        totalPurchasedDiamonds += diamondAmount;
      }

      // 5. 전체 사용된 다이아 수량 = 총 구매 - 현재 보유량
      const totalUsedDiamonds = totalPurchasedDiamonds - user.pink_dia;

      // 6. 이 결제보다 먼저 한 결제의 총 다이아 수량 계산 (FIFO 원칙 적용)
      let diamondsPurchasedBefore = 0;
      for (const p of allPayments) {
        if (p.createdAt < payment.createdAt) {
          diamondsPurchasedBefore += this.extractDiamondAmount(p.itemName);
        }
      }

      // 7. 먼저 사용한 다이아는 먼저 구매한 다이아라고 가정 (FIFO)
      // 과거 결제들의 다이아가 모두 사용되었을 때만 현재 결제의 다이아가 사용될 수 있음
      let usedFromThisPayment = 0;
      
      if (totalUsedDiamonds <= diamondsPurchasedBefore) {
        // 이전 구매분 다이아만 사용됨, 이 결제 다이아는 사용 안됨
        usedFromThisPayment = 0;
      } else {
        // 이전 구매분 + 현재 결제 다이아의 일부 사용됨
        usedFromThisPayment = Math.min(
          purchasedDiamonds,  // 최대 이 결제에서 구매한 다이아 수량까지만
          totalUsedDiamonds - diamondsPurchasedBefore  // 이전 구매분 사용 후 남은 사용량
        );
      }

      return Math.max(0, usedFromThisPayment); // 음수는 0으로 처리
    } catch (error) {
      // 오류 발생 시 안전하게 0으로 처리 (환불 가능하도록)
      return 0;
    }
  }

  // 상품명에서 다이아몬드 수량 추출
  private extractDiamondAmount(itemName: string): number {
    const diamondMatch = itemName.match(/(\d+)\s*다이아/);
    if (!diamondMatch) {
      return 0;
    }
    return parseInt(diamondMatch[1]);
  }

  async refundPayment(paymentKey: string, cancelReason: string, userId: number, amount: number) {
    try {
      // 테스트 결제 여부 확인
      const isTestPayment = paymentKey.startsWith('test_') || paymentKey.startsWith('tgen_');

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
      const diamondAmount = this.extractDiamondAmount(payment.itemName);
      
      if (diamondAmount <= 0) {
        throw new Error('올바르지 않은 상품명입니다.');
      }

      // 사용자 정보 조회
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 현재 보유 다이아가 환불할 다이아보다 적은 경우
      if (user.pink_dia < diamondAmount) {
        throw new Error('보유한 다이아가 환불할 수량보다 적습니다.');
      }

      // 다이아 사용 여부 확인
      const usedDiamonds = await this.getUsedDiamonds(userId, payment);
      
      if (usedDiamonds > 0) {
        throw new Error(`이미 ${usedDiamonds}개의 다이아몬드가 사용되어 환불이 불가능합니다.`);
      }

      if (isTestPayment) {
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
      const secretKey = this.configService.get('TOSS_SECRET_KEY');
      if (!secretKey) {
        throw new Error('토스 페이먼츠 시크릿 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      }

      const response = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cancelReason,
            amount
          })
        }
      );

      let responseData;
      try {
        const responseText = await response.text();
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error('환불 처리 중 오류가 발생했습니다.');
      }

      if (!response.ok) {
        throw new Error(responseData.message || '환불 처리 중 오류가 발생했습니다.');
      }

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