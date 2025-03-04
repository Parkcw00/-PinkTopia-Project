import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistService } from './chatblacklist.service';
import { ChatblacklistRepository } from './chatblacklist.repository';
import { UserRepository } from '../user/user.repository';
import { ChattingRoomRepository } from '../chattingroom/chattingroom.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ChatblacklistService', () => {
  let service: ChatblacklistService;
  let chatblacklistRepository: ChatblacklistRepository;
  let userRepository: UserRepository;
  let chattingRoomRepository: ChattingRoomRepository;

  const mockChatblacklistRepository = {
    findAllChatblacklist: jest.fn(),
    findByChatblacklist: jest.fn(),
    findByUserIdAndChattingRoomId: jest.fn(),
    createChatblacklist: jest.fn(),
    deleteChatblacklist: jest.fn(),
  };

  const mockUserRepository = {
    findId: jest.fn(),
  };

  const mockChattingRoomRepository = {
    findChattingRoomById: jest.fn(),
  };

  const mockBlacklist = {
    id: 1,
    user_id: 1,
    chatting_room_id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatblacklistService,
        {
          provide: ChatblacklistRepository,
          useValue: mockChatblacklistRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ChattingRoomRepository,
          useValue: mockChattingRoomRepository,
        },
      ],
    }).compile();

    service = module.get<ChatblacklistService>(ChatblacklistService);
    chatblacklistRepository = module.get<ChatblacklistRepository>(ChatblacklistRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    chattingRoomRepository = module.get<ChattingRoomRepository>(ChattingRoomRepository);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('createChatblacklist', () => {
    it('블랙리스트를 생성해야 합니다', async () => {
      const createDto = {
        user_id: 1,
        chatting_room_id: 1,
      };

      mockUserRepository.findId.mockResolvedValue({ id: 1 });
      mockChatblacklistRepository.findByUserIdAndChattingRoomId.mockResolvedValue(null);
      mockChattingRoomRepository.findChattingRoomById.mockResolvedValue({ id: 1 });
      mockChatblacklistRepository.createChatblacklist.mockResolvedValue(mockBlacklist);

      const result = await service.createChatblacklist(1, createDto);

      expect(result).toEqual(mockBlacklist);
    });

    it('이미 블랙리스트에 존재하는 경우 ConflictException을 던져야 합니다', async () => {
      const createDto = {
        user_id: 1,
        chatting_room_id: 1,
      };

      mockUserRepository.findId.mockResolvedValue({ id: 1 });
      mockChatblacklistRepository.findByUserIdAndChattingRoomId.mockResolvedValue(mockBlacklist);

      await expect(service.createChatblacklist(1, createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('모든 블랙리스트를 조회해야 합니다', async () => {
      mockChatblacklistRepository.findAllChatblacklist.mockResolvedValue([mockBlacklist]);

      const result = await service.findAll();

      expect(result).toEqual([mockBlacklist]);
    });

    it('블랙리스트가 없는 경우 NotFoundException을 던져야 합니다', async () => {
      mockChatblacklistRepository.findAllChatblacklist.mockResolvedValue(null);

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('특정 블랙리스트를 조회해야 합니다', async () => {
      mockChatblacklistRepository.findByChatblacklist.mockResolvedValue(mockBlacklist);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBlacklist);
    });

    it('존재하지 않는 블랙리스트 조회 시 NotFoundException을 던져야 합니다', async () => {
      mockChatblacklistRepository.findByChatblacklist.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('블랙리스트를 삭제해야 합니다', async () => {
      mockChatblacklistRepository.findByChatblacklist.mockResolvedValue(mockBlacklist);
      mockChatblacklistRepository.deleteChatblacklist.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ affected: 1 });
    });

    it('존재하지 않는 블랙리스트 삭제 시 NotFoundException을 던져야 합니다', async () => {
      mockChatblacklistRepository.findByChatblacklist.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
