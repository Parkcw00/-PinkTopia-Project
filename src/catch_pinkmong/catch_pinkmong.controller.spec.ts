import { Test, TestingModule } from '@nestjs/testing';
import { CatchPinkmongController } from './catch_pinkmong.controller';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { UserGuard } from 'src/user/guards/user-guard';
import { CanActivate } from '@nestjs/common';

describe('CatchPinkmongController', () => {
  let controller: CatchPinkmongController;
  let service: CatchPinkmongService;

  const mockCatchPinkmongService = {
    appearPinkmong: jest.fn((userId) => ({ success: true, userId })),
    feeding: jest.fn((userId, itemId) => ({ success: true, userId, itemId })),
    giveup: jest.fn((userId) => ({ success: true, userId })),
  };

  const mockUserGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatchPinkmongController],
      providers: [
        { provide: CatchPinkmongService, useValue: mockCatchPinkmongService },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue(mockUserGuard)
      .compile();

    controller = module.get<CatchPinkmongController>(CatchPinkmongController);
    service = module.get<CatchPinkmongService>(CatchPinkmongService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should trigger appearPinkmong', async () => {
    const req = { user: { id: 1 } };
    expect(await controller.catchPinkmong(req)).toEqual({
      success: true,
      userId: 1,
    });
    expect(service.appearPinkmong).toHaveBeenCalledWith(1);
  });

  it('should trigger feeding', async () => {
    const req = { user: { id: 1 } };
    const itemId = 5;
    expect(await controller.feeding(req, itemId)).toEqual({
      success: true,
      userId: 1,
      itemId,
    });
    expect(service.feeding).toHaveBeenCalledWith(1, itemId);
  });

  it('should trigger giveUp', async () => {
    const req = { user: { id: 1 } };
    expect(await controller.giveUp(req)).toEqual({ success: true, userId: 1 });
    expect(service.giveup).toHaveBeenCalledWith(1);
  });
});
