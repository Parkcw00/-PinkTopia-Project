import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { UserGuard } from '../user/guards/user-guard';

// 엔티티 모킹
jest.mock('./entities/payment.entity', () => ({
  Payment: class MockPayment {}
}));

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  const mockPaymentService = {
    createTestPayment: jest.fn(),
    createPayment: jest.fn(),
    getPaymentHistory: jest.fn(),
    refundPayment: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        }
      ],
    })
    .overrideGuard(UserGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('createTestPayment', () => {
    it('테스트 결제를 생성해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      
      mockPaymentService.createTestPayment.mockResolvedValue(mockPayment);

      const result = await controller.createTestPayment(mockUser);

      expect(service.createTestPayment).toHaveBeenCalledWith(mockUser.user.id);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('createPayment', () => {
    it('실제 결제를 생성해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const mockBody = {
        paymentKey: 'test_payment_key',
        itemName: '1000다이아',
        amount: 35000,
      };

      mockPaymentService.createPayment.mockResolvedValue(mockPayment);

      const result = await controller.createPayment(mockBody, mockUser);

      expect(service.createPayment).toHaveBeenCalledWith(
        mockUser.user.id,
        mockBody.paymentKey,
        mockBody.itemName,
        mockBody.amount,
      );
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPaymentHistory', () => {
    it('결제 내역을 조회해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const mockHistory = [mockPayment];

      mockPaymentService.getPaymentHistory.mockResolvedValue(mockHistory);

      const result = await controller.getPaymentHistory(mockUser);

      expect(service.getPaymentHistory).toHaveBeenCalledWith(mockUser.user.id);
      expect(result).toEqual(mockHistory);
    });
  });

  describe('refundPayment', () => {
    it('결제를 환불해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const mockBody = {
        paymentKey: 'test_payment_key',
        cancelReason: '고객 요청',
        amount: 35000,
      };

      const mockRefundResult = {
        message: '환불이 완료되었습니다.'
      };

      mockPaymentService.refundPayment.mockResolvedValue(mockRefundResult);

      const result = await controller.refundPayment(mockBody, mockUser);

      expect(service.refundPayment).toHaveBeenCalledWith(
        mockBody.paymentKey,
        mockBody.cancelReason,
        mockUser.user.id,
        mockBody.amount,
      );
      expect(result).toEqual(mockRefundResult);
    });
  });
}); 