import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, MoreThanOrEqual, FindManyOptions } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async find(options: any): Promise<Payment[]> {
    return this.paymentRepository.find(options);
  }

  async findOne(options: any): Promise<Payment | null> {
    return this.paymentRepository.findOne(options);
  }

  async save(payment: Partial<Payment>): Promise<Payment> {
    return this.paymentRepository.save(payment);
  }

  async update(criteria: any, partialEntity: Partial<Payment>): Promise<any> {
    return this.paymentRepository.update(criteria, partialEntity);
  }

  create(entityLike: Partial<Payment>): Payment {
    return this.paymentRepository.create(entityLike);
  }

  async findDiamondPurchases(userId: number, fromDate: Date): Promise<Payment[]> {
    const where: FindOptionsWhere<Payment> = {
      userId,
      isRefunded: false
    };

    if (fromDate) {
      where.createdAt = MoreThanOrEqual(fromDate);
    }

    return this.paymentRepository.find({
      where,
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findByPaymentKey(paymentKey: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { paymentKey }
    });
  }

  async findByUserId(userId: number, options?: Partial<FindManyOptions<Payment>>): Promise<Payment[]> {
    const defaultOptions: FindManyOptions<Payment> = {
      where: { userId },
      order: { createdAt: 'DESC' }
    };
    
    const mergedOptions = options 
      ? { ...defaultOptions, ...options } 
      : defaultOptions;
    
    return this.paymentRepository.find(mergedOptions);
  }

  async findNonRefundedByUserId(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        userId,
        isRefunded: false
      },
      order: {
        createdAt: 'ASC' // FIFO 원칙을 위해 오래된 결제부터 정렬
      }
    });
  }
} 