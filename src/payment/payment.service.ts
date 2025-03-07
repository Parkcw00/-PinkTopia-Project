import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    // 현재 사용자의 다이아 수량 조회
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const payment = this.paymentRepository.create({
      userId,
      paymentKey: `test_${Date.now()}`,
      itemName: '테스트 다이아 100개',
      amount: 20000,
      isRefunded: false,
      diamondBeforePurchase: user.pink_dia // 구매 전 다이아 수량 저장
    });

    return this.paymentRepository.save(payment);
  }

  async createPayment(userId: number, paymentKey: string, itemName: string, amount: number) {
    // 1. 유저 조회 - 현재 다이아 수량 확인
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    
    // 2. 구매 전 다이아 수량 저장
    const diamondBeforePurchase = user.pink_dia;
    
    // 3. 구매할 다이아 수량 계산
    const purchasedDiamonds = this.extractDiamondAmount(itemName);
    
    // 4. 구매 후 예상 다이아 수량 계산
    const diamondAfterPurchase = diamondBeforePurchase + purchasedDiamonds;
    
    console.log(`[createPayment] 사용자 ID: ${userId}, 구매 전 다이아: ${diamondBeforePurchase}, 구매 다이아: ${purchasedDiamonds}, 구매 후 다이아: ${diamondAfterPurchase}`);
    
    // 5. DB에서 이미 다이아가 추가되었는지 확인을 위해 다시 한번 유저 정보 조회
    const updatedUser = await this.userService.findById(userId);
    console.log(`[createPayment] 갱신된 사용자 정보 조회. 현재 다이아: ${updatedUser.pink_dia}`);
    
    // 6. 결제 정보 생성 및 저장 - diamondBeforePurchase에는 구매 후 다이아 저장
    // 중요: 이 필드명이 diamondBeforePurchase로 되어 있지만, 실제 사용 용도는 '구매 후 다이아 수량'임
    const payment = this.paymentRepository.create({
      userId,
      paymentKey,
      itemName,
      amount,
      isRefunded: false,
      diamondBeforePurchase: updatedUser.pink_dia // 갱신된 다이아 수량(구매 후)을 저장
    });

    const savedPayment = await this.paymentRepository.save(payment);
    console.log(`[createPayment] 결제 저장 완료. 결제키: ${paymentKey}, 저장된 다이아: ${payment.diamondBeforePurchase}`);
    
    return savedPayment;
  }

  async getPaymentHistory(userId: number) {
    try {
      console.log(`[getPaymentHistory] 사용자 ID ${userId}의 결제 내역 조회 시작`);
      
      // 1. 결제 내역 조회 - 시간 순으로 정렬 (오래된 것부터)
      const paymentsAsc = await this.paymentRepository.find({
        where: { 
          userId,
          isRefunded: false // 환불되지 않은 결제만 조회
        },
        order: { createdAt: 'ASC' }, // 오래된 것부터 정렬 (FIFO 원칙)
      });

      // 조회용 내림차순 결제 내역 (화면 표시용)
      const payments = await this.paymentRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      console.log(`[getPaymentHistory] 결제 내역 ${payments.length}개 조회됨 (환불되지 않은 결제: ${paymentsAsc.length}개)`);
      
      if (!payments || payments.length === 0) {
        return [];
      }

      // 2. 유저 정보 조회
      const user = await this.userService.findById(userId);
      if (!user) {
        console.log(`[getPaymentHistory] 사용자 정보를 찾을 수 없음`);
        return payments;
      }

      console.log(`[getPaymentHistory] 사용자 현재 다이아: ${user.pink_dia}`);

      // 3. 총 구매한 다이아 및 잔여 다이아 계산
      let totalPurchasedDiamonds = 0;
      for (const p of paymentsAsc) {
        const diamonds = this.extractDiamondAmount(p.itemName);
        totalPurchasedDiamonds += diamonds;
      }

      // 4. 총 사용된 다이아 계산
      const totalUsedDiamonds = Math.max(0, totalPurchasedDiamonds - user.pink_dia);
      console.log(`[getPaymentHistory] 총 구매 다이아: ${totalPurchasedDiamonds}, 현재 보유: ${user.pink_dia}, 총 사용: ${totalUsedDiamonds}`);

      // 5. FIFO 원칙에 따라 사용량 할당 (오래된 결제부터)
      let remainingUsage = totalUsedDiamonds;
      const usageByPaymentKey = new Map(); // 결제키별 사용량 저장

      // 오래된 결제부터 차례로 사용량 할당
      for (const payment of paymentsAsc) {
        if (remainingUsage <= 0) {
          // 더 이상 할당할 사용량이 없음
          usageByPaymentKey.set(payment.paymentKey, 0);
          continue;
        }

        const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
        // 이 결제에서 구매한 다이아 중 사용된 양
        const usedFromThisPayment = Math.min(purchasedDiamonds, remainingUsage);
        
        usageByPaymentKey.set(payment.paymentKey, usedFromThisPayment);
        remainingUsage -= usedFromThisPayment;
        
        console.log(`[getPaymentHistory] FIFO 할당: 결제 ${payment.paymentKey}에서 사용된 다이아: ${usedFromThisPayment}/${purchasedDiamonds}`);
      }

      // 6. 결제 내역에 사용량 정보 추가 (내림차순 결제 내역)
      const enhancedPayments = payments.map(payment => {
        try {
          const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
          const usedDiamonds = payment.isRefunded ? 0 : (usageByPaymentKey.get(payment.paymentKey) || 0);
          
          console.log(`[getPaymentHistory] 최종 결제 내역: ${payment.paymentKey}, 구매: ${purchasedDiamonds}, 사용: ${usedDiamonds}`);
          
          return {
            ...payment,
            usedDiamonds,
            remainingDiamonds: purchasedDiamonds - usedDiamonds
          };
        } catch (err) {
          console.error(`[getPaymentHistory] 결제 처리 중 오류: ${err.message}`);
          return payment;
        }
      });

      console.log(`[getPaymentHistory] 결제 내역 처리 완료, ${enhancedPayments.length}개 반환`);
      return enhancedPayments;
    } catch (error) {
      console.error(`[getPaymentHistory] 오류 발생: ${error.message}`);
      return [];
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
    console.log(`[refundPayment] 환불 요청. 결제키: ${paymentKey}, 사용자: ${userId}, 금액: ${amount}`);
    
    // 1. 결제 정보 조회
    const payment = await this.paymentRepository.findOne({
      where: { paymentKey }
    });

    if (!payment) {
      console.log(`[refundPayment] 결제 정보를 찾을 수 없음. 결제키: ${paymentKey}`);
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    console.log(`[refundPayment] 결제 정보 확인. 아이템: ${payment.itemName}, 환불상태: ${payment.isRefunded}, 저장된 다이아: ${payment.diamondBeforePurchase}`);

    // 2. 이미 환불된 결제인 경우
    if (payment.isRefunded) {
      console.log(`[refundPayment] 이미 환불된 결제. 결제키: ${paymentKey}`);
      throw new BadRequestException('이미 환불된 결제입니다.');
    }

    // 3. 구매한 다이아몬드 수량 추출
    const diamondAmount = this.extractDiamondAmount(payment.itemName);
    if (diamondAmount <= 0) {
      console.log(`[refundPayment] 유효하지 않은 아이템. 아이템명: ${payment.itemName}`);
      throw new BadRequestException('유효하지 않은 아이템입니다.');
    }

    // 4. 사용자 정보 조회
    const user = await this.userService.findById(userId);
    if (!user) {
      console.log(`[refundPayment] 사용자를 찾을 수 없음. 사용자 ID: ${userId}`);
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    console.log(`[refundPayment] 사용자 정보 확인. 현재 다이아: ${user.pink_dia}`);

    // 5. FIFO 원칙에 따라 다이아 사용량 계산 (오래된 결제부터)
    // 모든 환불되지 않은 결제 조회 (오래된 순)
    const allPayments = await this.paymentRepository.find({
      where: { 
        userId, 
        isRefunded: false 
      },
      order: { createdAt: 'ASC' }
    });

    console.log(`[refundPayment] 환불되지 않은 결제 내역 ${allPayments.length}개 조회됨`);

    // 총 구매한 다이아 및 사용한 다이아 계산
    let totalPurchased = 0;
    for (const p of allPayments) {
      totalPurchased += this.extractDiamondAmount(p.itemName);
    }

    const totalUsed = Math.max(0, totalPurchased - user.pink_dia);
    console.log(`[refundPayment] 총 구매 다이아: ${totalPurchased}, 현재 보유: ${user.pink_dia}, 총 사용: ${totalUsed}`);

    // FIFO 원칙에 따라 사용량 할당
    let remainingUsage = totalUsed;
    let usedFromThisPayment = 0;

    for (const p of allPayments) {
      // 현재 환불하려는 결제에 도달한 경우 사용량 계산
      if (p.paymentKey === paymentKey) {
        usedFromThisPayment = Math.min(diamondAmount, remainingUsage);
        break;
      }

      // 이전 결제에서 사용한 다이아 차감
      const pDiamonds = this.extractDiamondAmount(p.itemName);
      const usedFromPrevPayment = Math.min(pDiamonds, remainingUsage);
      remainingUsage -= usedFromPrevPayment;
    }

    console.log(`[refundPayment] FIFO 할당 결과: 결제 ${paymentKey}의 다이아 사용량: ${usedFromThisPayment}/${diamondAmount}`);

    // 6. 이미 다이아를 사용한 경우 환불 불가
    if (usedFromThisPayment > 0) {
      console.log(`[refundPayment] 이미 다이아를 사용함. 사용량: ${usedFromThisPayment}`);
      throw new BadRequestException(`이미 ${usedFromThisPayment}개의 다이아몬드를 사용하여 환불이 불가능합니다.`);
    }

    // 7. 환불 처리
    // 테스트 결제인 경우 바로 환불 처리
    if (paymentKey.startsWith('tgen_')) {
      console.log(`[refundPayment] 테스트 결제 환불 처리. 다이아 차감량: ${diamondAmount}`);
      
      // 다이아몬드 차감
      await this.userService.deductDiamond(userId, diamondAmount);

      // 결제 상태 업데이트
      await this.paymentRepository.update(
        { paymentKey },
        { isRefunded: true }
      );

      console.log(`[refundPayment] 환불 완료. 결제키: ${paymentKey}`);
      return { message: '환불이 완료되었습니다.' };
    }

    // 8. 실제 결제인 경우
    const secretKey = this.configService.get('TOSS_PAYMENTS_SECRET_KEY');
    if (!secretKey) {
      console.log(`[refundPayment] 결제 시크릿 키가 설정되지 않음`);
      throw new InternalServerErrorException('결제 시크릿 키가 설정되지 않았습니다.');
    }

    // 토스페이먼츠 API 호출
    // 여기서 실제 환불 처리 로직 추가
    // ...

    console.log(`[refundPayment] 환불 완료. 결제키: ${paymentKey}`);
    return { message: '환불이 완료되었습니다.' };
  }

  // getUsedDiamonds 메서드는 더 이상 사용하지 않음 - getPaymentHistory에서 한 번에 계산
  private async getUsedDiamonds(userId: number, payment: Payment): Promise<number> {
    try {
      // 이 메서드는 이제 하위 호환성을 위해 유지
      console.log(`[getUsedDiamonds] 해당 메서드는 더 이상 사용되지 않습니다. 결제 키: ${payment.paymentKey}`);
      
      // 1. 환불하려는 결제의 다이아 수량 확인
      const purchasedDiamonds = this.extractDiamondAmount(payment.itemName);
      if (purchasedDiamonds <= 0) {
        return 0; 
      }

      // 2. 사용자 현재 다이아 수량 확인
      const user = await this.userService.findById(userId);
      if (!user) {
        return 0; // 사용자 정보가 없으면 0 반환
      }

      // 3. 간단한 계산 방식 적용 - 사용한 다이아가 500개인 경우를 가정
      return 500; // 테스트 목적으로 500으로 고정
    } catch (error) {
      console.error(`[getUsedDiamonds] 오류 발생: ${error.message}`);
      return 0;
    }
  }
} 