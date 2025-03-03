import { Test, TestingModule } from '@nestjs/testing';
import { ChattingController } from './chatting.controller';
import { ChattingService } from './chatting.service';
import { UserGuard } from '../user/guards/user-guard';
import { ExecutionContext } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

describe('ChattingController', () => {
  let controller: ChattingController;
  let mockService: Partial<ChattingService>;

  const mockUser = { id: 1, username: 'testUser' };

  beforeEach(async () => {
    mockService = {
      create: jest.fn().mockResolvedValue({}),
      uploadFile: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
    };

    const mockGuard: Partial<UserGuard> = {
      canActivate: async (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser;
        return true;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChattingController],
      providers: [{ provide: ChattingService, useValue: mockService }],
    })
      .overrideGuard(UserGuard)
      .useValue(mockGuard)
      .overrideInterceptor(FileInterceptor('file'))
      .useValue({})
      .compile();

    controller = module.get<ChattingController>(ChattingController);
  });

  describe('POST /chatting', () => {
    it('should return created message', async () => {
      const result = await controller.create({ user: mockUser } as any, '1', {
        message: 'test',
      } as any);
      expect(result).toBeDefined();
      expect(mockService.create).toHaveBeenCalledWith(
        mockUser,
        '1',
        expect.anything(),
      );
    });
  });

  describe('GET /chattings', () => {
    it('should return message list', async () => {
      const result = await controller.findAll({ user: mockUser } as any, '1');
      expect(result).toBeInstanceOf(Array);
    });
  });
});
