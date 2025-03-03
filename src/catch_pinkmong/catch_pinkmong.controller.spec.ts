import { Test, TestingModule } from '@nestjs/testing';
import { CatchPinkmongController } from './catch_pinkmong.controller';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { UserGuard } from 'src/user/guards/user-guard';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';

describe('CatchPinkmongController', () => {
  let controller: CatchPinkmongController;
  let service: CatchPinkmongService;

  // 가짜 유저 데이터
  const mockUser = { id: 1 };

  // 서비스의 Mock (Fake)
  const mockCatchPinkmongService = {
    appearPinkmong: jest
      .fn()
      .mockResolvedValue({ message: 'Pinkmong appeared!' }),
    feeding: jest.fn().mockResolvedValue({ message: 'Pinkmong is fed!' }),
    giveup: jest
      .fn()
      .mockResolvedValue({ message: 'You gave up catching Pinkmong.' }),
  };

  // 가짜 UserGuard 설정 (모든 요청을 통과하도록 설정)
  class MockUserGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser; // 요청 객체에 mockUser 주입
      return true;
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatchPinkmongController],
      providers: [
        {
          provide: CatchPinkmongService,
          useValue: mockCatchPinkmongService, // Mock 서비스 사용
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useClass(MockUserGuard) // Mock UserGuard 사용
      .compile();

    controller = module.get<CatchPinkmongController>(CatchPinkmongController);
    service = module.get<CatchPinkmongService>(CatchPinkmongService);
  });

  it('컨트롤러가 정의되어 있어야 함', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /catchpinkmong', () => {
    it('유저가 Pinkmong을 잡는 요청을 처리해야 함', async () => {
      const result = await controller.catchPinkmong({ user: mockUser });
      expect(result).toEqual({ message: 'Pinkmong appeared!' });
      expect(service.appearPinkmong).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('POST /feeding', () => {
    it('유저가 Pinkmong에게 먹이를 주는 요청을 처리해야 함', async () => {
      const itemId = 2;
      const result = await controller.feeding({ user: mockUser }, itemId);
      expect(result).toEqual({ message: 'Pinkmong is fed!' });
      expect(service.feeding).toHaveBeenCalledWith(mockUser.id, itemId);
    });
  });

  describe('POST /giveup', () => {
    it('유저가 Pinkmong 포기를 요청하면 처리해야 함', async () => {
      const result = await controller.giveUp({ user: mockUser });
      expect(result).toEqual({ message: 'You gave up catching Pinkmong.' });
      expect(service.giveup).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
