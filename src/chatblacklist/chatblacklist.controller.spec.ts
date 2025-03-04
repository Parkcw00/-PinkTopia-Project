import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistController } from './chatblacklist.controller';
import { ChatblacklistService } from './chatblacklist.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';

describe('ChatblacklistController', () => {
  let controller: ChatblacklistController;
  let service: ChatblacklistService;

  const mockChatblacklistService = {
    createChatblacklist: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockBlacklist = {
    id: 1,
    user_id: 1,
    chatting_room_id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatblacklistController],
      providers: [
        {
          provide: ChatblacklistService,
          useValue: mockChatblacklistService,
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChatblacklistController>(ChatblacklistController);
    service = module.get<ChatblacklistService>(ChatblacklistService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('블랙리스트를 생성해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const createDto = {
        user_id: 2,
        chatting_room_id: 1,
      };

      mockChatblacklistService.createChatblacklist.mockResolvedValue(mockBlacklist);

      const result = await controller.create(mockReq, createDto);

      expect(service.createChatblacklist).toHaveBeenCalledWith(mockReq.user.id, createDto);
      expect(result).toEqual(mockBlacklist);
    });
  });

  describe('findAll', () => {
    it('모든 블랙리스트를 조회해야 합니다', async () => {
      mockChatblacklistService.findAll.mockResolvedValue([mockBlacklist]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockBlacklist]);
    });
  });

  describe('findOne', () => {
    it('특정 블랙리스트를 조회해야 합니다', async () => {
      mockChatblacklistService.findOne.mockResolvedValue(mockBlacklist);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBlacklist);
    });
  });

  describe('remove', () => {
    it('블랙리스트를 삭제해야 합니다', async () => {
      const deleteResult = { affected: 1 };
      mockChatblacklistService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
