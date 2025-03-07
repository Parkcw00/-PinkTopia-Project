import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// 엔티티 모킹
jest.mock('./entities/payment.entity', () => ({
  Payment: class MockPayment {}
}));

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: PaymentRepository;
  let userService: UserService;
  let configService: ConfigService;

  const mockPaymentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    findDiamondPurchases: jest.fn(),
    findByPaymentKey: jest.fn(),
    findByUserId: jest.fn(),
    findNonRefundedByUserId: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
    deductDiamond: jest.fn(),
    addDiamond: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockPayment = {
    id: 1,
    userId: 1,
    paymentKey: 'test_payment_key',
    itemName: '1000다이아',
    amount: 35000,
    isRefunded: false,
    diamondBeforePurchase: 500,
    createdAt: new Date(),
  };

  const mockUser = {
    id: 1,
    pink_dia: 500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useValue: mockPaymentRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get<PaymentRepository>(PaymentRepository);
    userService = module.get<UserService>(UserService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('createTestPayment', () => {
    it('테스트 결제를 생성해야 합니다', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.createTestPayment(1);

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('사용자가 없으면 NotFoundException을 던져야 합니다', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.createTestPayment(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPayment', () => {
    it('실제 결제를 생성해야 합니다', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.createPayment(1, 'test_payment_key', '1000다이아', 35000);

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockPaymentRepository.create).toHaveBeenCalled();
      expect(mockPaymentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('사용자가 없으면 NotFoundException을 던져야 합니다', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(
        service.createPayment(999, 'test_payment_key', '1000다이아', 35000)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPaymentHistory', () => {
    it('결제 내역을 조회해야 합니다', async () => {
      const mockHistory = [mockPayment];
      const enhancedMockPayment = {
        ...mockPayment,
        usedDiamonds: 0,
        remainingDiamonds: 1000,
      };
      const enhancedMockHistory = [enhancedMockPayment];

      mockPaymentRepository.find.mockResolvedValue(mockHistory);
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await service.getPaymentHistory(1);

      expect(mockPaymentRepository.find).toHaveBeenCalled();
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('refundPayment', () => {
    it('결제를 환불해야 합니다', async () => {
      const mockNonRefundedPayments = [mockPayment];
      
      mockPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockUserService.findById.mockResolvedValue(mockUser);
      mockPaymentRepository.find.mockResolvedValue(mockNonRefundedPayments);
      mockConfigService.get.mockReturnValue('test_secret_key');
      mockUserService.deductDiamond.mockResolvedValue(true);
      mockPaymentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.refundPayment('test_payment_key', '고객 요청', 1, 35000);

      expect(mockPaymentRepository.findOne).toHaveBeenCalled();
      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockUserService.deductDiamond).toHaveBeenCalled();
      expect(mockPaymentRepository.update).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
    });

    it('결제 정보가 없으면 NotFoundException을 던져야 합니다', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refundPayment('invalid_key', '고객 요청', 1, 35000)
      ).rejects.toThrow(NotFoundException);
    });

    it('이미 환불된 결제는 BadRequestException을 던져야 합니다', async () => {
      mockPaymentRepository.findOne.mockResolvedValue({
        ...mockPayment,
        isRefunded: true,
      });

      await expect(
        service.refundPayment('test_payment_key', '고객 요청', 1, 35000)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('extractDiamondAmount', () => {
    it('아이템 이름에서 다이아몬드 수량을 추출해야 합니다', () => {
      // @ts-ignore: Private 메서드 테스트
      const result = service.extractDiamondAmount('1000다이아');
      expect(result).toBe(1000);
    });

    it('유효하지 않은 아이템 이름은 0을 반환해야 합니다', () => {
      // @ts-ignore: Private 메서드 테스트
      const result = service.extractDiamondAmount('잘못된 이름');
      expect(result).toBe(0);
    });
  });
}); 