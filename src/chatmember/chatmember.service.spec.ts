import { Test, TestingModule } from '@nestjs/testing';
import { ChatmemberService } from './chatmember.service';
import { ChatmemberRepository } from './chatmember.repository';
import { UserRepository } from '../user/user.repository';
import { ChattingRoomRepository } from '../chattingroom/chattingroom.repository';
import { ChatblacklistRepository } from '../chatblacklist/chatblacklist.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Chatmember } from './entities/chatmember.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ChatmemberService', () => {
  let service: ChatmemberService;
  let chatmemberRepository: ChatmemberRepository;
  let userRepository: UserRepository;
  let chattingRoomRepository: ChattingRoomRepository;
  let chatblacklistRepository: ChatblacklistRepository;

  const mockChatmemberRepository = {
    findAllChatmember: jest.fn(),
    findByChatmember: jest.fn(),
    findByUserIdAndChattingRoomId: jest.fn(),
    createChatmember: jest.fn(),
  };

  const mockUserRepository = {
    findUserId: jest.fn(),
  };

  const mockChattingRoomRepository = {
    findChattingRoomById: jest.fn(),
  };

  const mockChatblacklistRepository = {
    findByUserIdAndChattingRoomId: jest.fn(),
  };

  const mockTypeOrmRepository = {
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(true),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
  };

  const mockChatmember = {
    id: 1,
    user_id: 1,
    chatting_room_id: 1,
    admin: false,
    user: {
      id: 1,
      email: 'test@test.com',
      nickname: 'tester',
      profile_image: 'profile.jpg',
      birthday: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatmemberService,
        {
          provide: ChatmemberRepository,
          useValue: mockChatmemberRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ChattingRoomRepository,
          useValue: mockChattingRoomRepository,
        },
        {
          provide: ChatblacklistRepository,
          useValue: mockChatblacklistRepository,
        },
        {
          provide: getRepositoryToken(Chatmember),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    service = module.get<ChatmemberService>(ChatmemberService);
    chatmemberRepository = module.get<ChatmemberRepository>(ChatmemberRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    chattingRoomRepository = module.get<ChattingRoomRepository>(ChattingRoomRepository);
    chatblacklistRepository = module.get<ChatblacklistRepository>(ChatblacklistRepository);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('createChatmember', () => {
    it('채팅멤버를 생성해야 합니다', async () => {
      const userId = 1;
      const createChatmemberDto = {
        chatting_room_id: 1,
        admin: false,
      };

      mockUserRepository.findUserId.mockResolvedValue({ id: userId });
      mockChattingRoomRepository.findChattingRoomById.mockResolvedValue({ id: 1 });
      mockChatblacklistRepository.findByUserIdAndChattingRoomId.mockResolvedValue(null);
      mockChatmemberRepository.findByUserIdAndChattingRoomId.mockResolvedValue(null);
      mockChatmemberRepository.createChatmember.mockResolvedValue(mockChatmember);

      const result = await service.createChatmember(userId, createChatmemberDto);

      expect(result).toEqual(mockChatmember);
    });

    it('이미 존재하는 채팅멤버면 ConflictException을 던져야 합니다', async () => {
      const userId = 1;
      const createChatmemberDto = {
        chatting_room_id: 1,
        admin: false,
      };

      mockUserRepository.findUserId.mockResolvedValue({ id: userId });
      mockChattingRoomRepository.findChattingRoomById.mockResolvedValue({ id: 1 });
      mockChatblacklistRepository.findByUserIdAndChattingRoomId.mockResolvedValue(null);
      mockChatmemberRepository.findByUserIdAndChattingRoomId.mockResolvedValue(mockChatmember);

      await expect(
        service.createChatmember(userId, createChatmemberDto)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAllChatMember', () => {
    it('모든 채팅멤버를 조회해야 합니다', async () => {
      const mockChatmembers = [mockChatmember];
      mockChatmemberRepository.findAllChatmember.mockResolvedValue(mockChatmembers);

      const result = await service.findAllChatMember();

      expect(result).toEqual(mockChatmembers.map(member => ({
        id: member.id,
        user_id: member.user_id,
        chatting_room_id: member.chatting_room_id,
      })));
    });
  });

  describe('findOneChatMember', () => {
    it('특정 채팅멤버를 조회해야 합니다', async () => {
      mockChatmemberRepository.findByChatmember.mockResolvedValue(mockChatmember);

      const result = await service.findOneChatMember(1);

      expect(result).toEqual({
        ...mockChatmember,
        user: {
          id: mockChatmember.user.id,
          email: mockChatmember.user.email,
          nickname: mockChatmember.user.nickname,
          profile_image: mockChatmember.user.profile_image,
          birthday: mockChatmember.user.birthday,
        },
      });
    });

    it('존재하지 않는 채팅멤버 조회 시 NotFoundException을 던져야 합니다', async () => {
      mockChatmemberRepository.findByChatmember.mockResolvedValue(null);

      await expect(service.findOneChatMember(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteChatMember', () => {
    it('채팅멤버를 삭제해야 합니다', async () => {
      mockChatmemberRepository.findByUserIdAndChattingRoomId.mockResolvedValue(mockChatmember);

      const result = await service.deleteChatMember(1, 1);

      expect(result).toEqual({ message: '채팅방에서 나갔습니다.' });
    });

    it('존재하지 않는 채팅멤버 삭제 시 NotFoundException을 던져야 합니다', async () => {
      mockChatmemberRepository.findByUserIdAndChattingRoomId.mockResolvedValue(null);

      await expect(service.deleteChatMember(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
