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

    console.log(`[결제내역 조회] 사용자 ID: ${userId}, 결제 건수: ${payments.length}`);

    // 유저 다이아 보유량 로깅
    const user = await this.userService.findById(userId);
    if (user) {
      console.log(`[결제내역 조회] 현재 다이아 보유량: ${user.pink_dia}`);
    }

    // 각 결제 항목에 대해 사용된 다이아몬드 수량 계산
    const enhancedPayments = await Promise.all(payments.map(async (payment) => {
      console.log(`[결제 계산] 결제키: ${payment.paymentKey}, 상품명: ${payment.itemName}`);
      
      const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
      console.log(`[결제 계산] 구매 다이아: ${purchasedDiamonds}`);
      
      const usedDiamonds = await this.getUsedDiamonds(userId, payment);
      console.log(`[결제 계산] 사용 다이아: ${usedDiamonds}, 남은 다이아: ${purchasedDiamonds - usedDiamonds}`);
      
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
      console.log(`[다이아 사용량 분석] 결제키: ${payment.paymentKey}, 결제일: ${payment.createdAt}`);
      
      // 1. 환불하려는 결제의 다이아 수량 확인
      const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
      console.log(`[다이아 사용량 분석] 구매 다이아: ${purchasedDiamonds}`);
      
      if (purchasedDiamonds <= 0) {
        console.log(`[다이아 사용량 분석] 다이아 상품이 아니거나 파싱 실패`);
        return 0; 
      }

      // 2. 사용자 현재 다이아 수량 확인
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }
      console.log(`[다이아 사용량 분석] 현재 다이아 보유량: ${user.pink_dia}`);

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
      console.log(`[다이아 사용량 분석] 총 결제 건수: ${allPayments.length}`);

      // 4. 총 구매한 다이아 수량 계산
      let totalPurchasedDiamonds = 0;
      for (const p of allPayments) {
        const diamondAmount = this.extractDiamondAmount(p.itemName);
        totalPurchasedDiamonds += diamondAmount;
      }
      console.log(`[다이아 사용량 분석] 총 구매 다이아: ${totalPurchasedDiamonds}`);

      // 5. 전체 사용된 다이아 수량 = 총 구매 - 현재 보유량
      const totalUsedDiamonds = totalPurchasedDiamonds - user.pink_dia;
      console.log(`[다이아 사용량 분석] 총 사용 다이아: ${totalUsedDiamonds}`);

      // 6. 이 결제보다 먼저 한 결제의 총 다이아 수량 계산 (FIFO 원칙 적용)
      let diamondsPurchasedBefore = 0;
      for (const p of allPayments) {
        if (p.createdAt < payment.createdAt) {
          diamondsPurchasedBefore += this.extractDiamondAmount(p.itemName);
        }
      }
      console.log(`[다이아 사용량 분석] 이전 구매 다이아: ${diamondsPurchasedBefore}`);

      // 7. 먼저 사용한 다이아는 먼저 구매한 다이아라고 가정 (FIFO)
      // 과거 결제들의 다이아가 모두 사용되었을 때만 현재 결제의 다이아가 사용될 수 있음
      let usedFromThisPayment = 0;
      
      if (totalUsedDiamonds <= diamondsPurchasedBefore) {
        // 이전 구매분 다이아만 사용됨, 이 결제 다이아는 사용 안됨
        console.log(`[다이아 사용량 분석] 이 결제의 다이아는 아직 사용되지 않음`);
        usedFromThisPayment = 0;
      } else {
        // 이전 구매분 + 현재 결제 다이아의 일부 사용됨
        usedFromThisPayment = Math.min(
          purchasedDiamonds,  // 최대 이 결제에서 구매한 다이아 수량까지만
          totalUsedDiamonds - diamondsPurchasedBefore  // 이전 구매분 사용 후 남은 사용량
        );
        console.log(`[다이아 사용량 분석] 이 결제에서 사용된 다이아: ${usedFromThisPayment}`);
      }

      return Math.max(0, usedFromThisPayment); // 음수는 0으로 처리
    } catch (error) {
      console.error('다이아몬드 사용량 계산 중 오류:', error);
      // 오류 발생 시 안전하게 0으로 처리 (환불 가능하도록)
      console.log(`[다이아 사용량 분석] 오류 발생으로 0으로 처리 (환불 가능)`);
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
      console.log(`[환불 요청] 결제키: ${paymentKey}, 사용자: ${userId}, 금액: ${amount}`);
      
      // 테스트 결제 여부 확인
      const isTestPayment = paymentKey.startsWith('test_') || paymentKey.startsWith('tgen_');
      console.log(`[환불 요청] 테스트 결제 여부: ${isTestPayment}`);

      // 결제 정보 조회
      const payment = await this.paymentRepository.findOne({ where: { paymentKey } });
      if (!payment) {
        console.log(`[환불 오류] 결제 정보 없음: ${paymentKey}`);
        throw new Error('결제 정보를 찾을 수 없습니다.');
      }
      console.log(`[환불 요청] 결제 정보: 상품명=${payment.itemName}, 금액=${payment.amount}, 이미환불=${payment.isRefunded}`);
      
      if (payment.isRefunded) {
        console.log(`[환불 오류] 이미 환불된 결제: ${paymentKey}`);
        throw new Error('이미 환불된 결제입니다.');
      }
      if (payment.amount < amount) {
        console.log(`[환불 오류] 환불 금액 초과: 요청=${amount}, 결제=${payment.amount}`);
        throw new Error('환불 금액이 결제 금액보다 클 수 없습니다.');
      }

      // 상품명에서 다이아 수량 추출
      const diamondAmount = this.extractDiamondAmount(payment.itemName);
      console.log(`[환불 요청] 다이아 수량: ${diamondAmount}`);
      
      if (diamondAmount <= 0) {
        console.log(`[환불 오류] 올바르지 않은 상품명 (다이아 추출 실패): ${payment.itemName}`);
        throw new Error('올바르지 않은 상품명입니다.');
      }

      // 사용자 정보 조회
      const user = await this.userService.findById(userId);
      if (!user) {
        console.log(`[환불 오류] 사용자 정보 없음: ${userId}`);
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }
      console.log(`[환불 요청] 사용자 정보: 현재 다이아=${user.pink_dia}`);

      // 현재 보유 다이아가 환불할 다이아보다 적은 경우
      if (user.pink_dia < diamondAmount) {
        console.log(`[환불 오류] 보유 다이아 부족: 보유=${user.pink_dia}, 필요=${diamondAmount}`);
        throw new Error('보유한 다이아가 환불할 수량보다 적습니다.');
      }

      // 다이아 사용 여부 확인
      console.log(`[환불 요청] 다이아 사용량 확인 중...`);
      const usedDiamonds = await this.getUsedDiamonds(userId, payment);
      console.log(`[환불 요청] 사용된 다이아: ${usedDiamonds}개`);
      
      if (usedDiamonds > 0) {
        console.log(`[환불 오류] 이미 다이아가 사용됨: ${usedDiamonds}개`);
        throw new Error(`이미 ${usedDiamonds}개의 다이아몬드가 사용되어 환불이 불가능합니다.`);
      }

      if (isTestPayment) {
        console.log(`[환불 처리] 테스트 결제 환불 진행`);
        // 다이아 차감
        await this.userService.deductDiamond(userId, diamondAmount);
        console.log(`[환불 처리] 다이아 차감 완료: ${diamondAmount}개`);

        // 결제 내역의 환불 상태 업데이트
        await this.paymentRepository.update(
          { paymentKey },
          { isRefunded: true }
        );
        console.log(`[환불 처리] 결제 상태 업데이트 완료: isRefunded=true`);

        return {
          success: true,
          message: '테스트 결제 환불이 완료되었습니다.',
          refundAmount: amount,
          deductedDiamond: diamondAmount
        };
      }

      console.log(`[환불 처리] 실제 결제 환불 진행`);
      // 실제 결제인 경우 토스 페이먼츠 API 호출
      const secretKey = this.configService.get('TOSS_SECRET_KEY');
      if (!secretKey) {
        console.log(`[환불 오류] 토스 시크릿 키 없음`);
        throw new Error('토스 페이먼츠 시크릿 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      }

      console.log(`[환불 처리] 토스 API 호출 시작`);
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
      console.log(`[환불 처리] 토스 API 응답 상태: ${response.status}`);

      let responseData;
      try {
        const responseText = await response.text();
        console.log(`[환불 처리] 토스 API 응답: ${responseText}`);
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log(`[환불 오류] 토스 API 응답 파싱 실패: ${e.message}`);
        throw new Error('환불 처리 중 오류가 발생했습니다.');
      }

      if (!response.ok) {
        console.log(`[환불 오류] 토스 API 오류: ${responseData?.message || '알 수 없는 오류'}`);
        throw new Error(responseData.message || '환불 처리 중 오류가 발생했습니다.');
      }

      // 다이아 차감
      console.log(`[환불 처리] 다이아 차감 시작: ${diamondAmount}개`);
      await this.userService.deductDiamond(userId, diamondAmount);
      console.log(`[환불 처리] 다이아 차감 완료`);

      // 결제 내역의 환불 상태 업데이트
      console.log(`[환불 처리] 결제 상태 업데이트 시작`);
      await this.paymentRepository.update(
        { paymentKey },
        { isRefunded: true }
      );
      console.log(`[환불 처리] 결제 상태 업데이트 완료`);

      return {
        success: true,
        message: '환불이 완료되었습니다.',
        refundAmount: amount,
        deductedDiamond: diamondAmount
      };
    } catch (error) {
      console.log(`[환불 오류] 처리 실패: ${error.message || '알 수 없는 오류'}`);
      throw new BadRequestException(error.message || '환불 처리 중 오류가 발생했습니다.');
    }
  }
} 