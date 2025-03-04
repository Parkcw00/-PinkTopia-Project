import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChattingRoomRepository } from './chattingroom.repository';
import { ChattingRoom } from './entities/chattingroom.entity';
import { Chatmember } from '../chatmember/entities/chatmember.entity';
import { User } from '../user/entities/user.entity';
import { DataSource } from 'typeorm';

describe('ChattingRoomRepository', () => {
  let repository: ChattingRoomRepository;
  let mockChattingRoomRepository;
  let mockChatMemberRepository;
  let mockUserRepository;
  let mockDataSource;

  beforeEach(async () => {
    mockChattingRoomRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    };

    mockChatMemberRepository = {
      save: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingRoomRepository,
        {
          provide: getRepositoryToken(ChattingRoom),
          useValue: mockChattingRoomRepository,
        },
        {
          provide: getRepositoryToken(Chatmember),
          useValue: mockChatMemberRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<ChattingRoomRepository>(ChattingRoomRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createChattingRoom', () => {
    it('채팅방을 성공적으로 생성해야 함', async () => {
      const createChattingRoomDto = { title: '테스트 채팅방' };
      const expectedResult = { id: 1, title: '테스트 채팅방' };

      mockChattingRoomRepository.create.mockReturnValue(expectedResult);
      mockChattingRoomRepository.save.mockResolvedValue(expectedResult);

      const result = await repository.createChattingRoom(createChattingRoomDto);

      expect(mockChattingRoomRepository.create).toHaveBeenCalledWith({
        ...createChattingRoomDto,
      });
      expect(mockChattingRoomRepository.save).toHaveBeenCalledWith(
        expectedResult,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addChatMember', () => {
    it('채팅방에 관리자 권한을 가진 멤버를 추가해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { chatting_room_id, user_id, admin: true };

      mockChatMemberRepository.save.mockResolvedValue(expectedResult);

      const result = await repository.addChatMember(chatting_room_id, user_id);

      expect(mockChatMemberRepository.save).toHaveBeenCalledWith({
        chatting_room_id,
        user_id,
        admin: true,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findChatMember', () => {
    it('채팅방 멤버를 성공적으로 조회해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { chatting_room_id, user_id, admin: true };

      const mockQueryBuilder = mockChatMemberRepository.createQueryBuilder();
      mockQueryBuilder.getOne.mockResolvedValue(expectedResult);

      const result = await repository.findChatMember(chatting_room_id, user_id);

      expect(mockChatMemberRepository.createQueryBuilder).toHaveBeenCalledWith(
        'chatmember',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'chatmember.chatting_room_id = :chatting_room_id',
        { chatting_room_id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'chatmember.user_id = :user_id',
        { user_id },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findChatMemberByUserId', () => {
    it('사용자 ID로 채팅방 멤버를 조회해야 함', async () => {
      const user_id = 1;
      const expectedResult = [
        { chatting_room_id: 1, user_id, admin: true },
        { chatting_room_id: 2, user_id, admin: false },
      ];

      mockChatMemberRepository.find.mockResolvedValue(expectedResult);

      const result = await repository.findChatMemberByUserId(user_id);

      expect(mockChatMemberRepository.find).toHaveBeenCalledWith({
        where: { user_id },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllChatMembers', () => {
    it('채팅방의 모든 멤버를 조회해야 함', async () => {
      const chatting_room_id = 1;
      const expectedResult = [
        { chatting_room_id, user_id: 1, admin: true },
        { chatting_room_id, user_id: 2, admin: false },
      ];

      const mockQueryBuilder = mockChatMemberRepository.createQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult);

      const result = await repository.findAllChatMembers(chatting_room_id);

      expect(mockChatMemberRepository.createQueryBuilder).toHaveBeenCalledWith(
        'chatmember',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'chatmember.chatting_room_id = :chatting_room_id',
        { chatting_room_id },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAdmin', () => {
    it('사용자에게 관리자 권한을 부여해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { affected: 1 };

      mockChatMemberRepository.update.mockResolvedValue(expectedResult);

      const result = await repository.getAdmin(chatting_room_id, user_id);

      expect(mockChatMemberRepository.update).toHaveBeenCalledWith(
        { chatting_room_id, user_id },
        { admin: true },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteAdmin', () => {
    it('사용자의 관리자 권한을 삭제해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { affected: 1 };

      mockChatMemberRepository.update.mockResolvedValue(expectedResult);

      const result = await repository.deleteAdmin(chatting_room_id, user_id);

      expect(mockChatMemberRepository.update).toHaveBeenCalledWith(
        { chatting_room_id, user_id },
        { admin: false },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteChatMember', () => {
    it('채팅방 멤버를 삭제해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { affected: 1 };

      mockChatMemberRepository.delete.mockResolvedValue(expectedResult);

      const result = await repository.deleteChatMember(
        chatting_room_id,
        user_id,
      );

      expect(mockChatMemberRepository.delete).toHaveBeenCalledWith({
        chatting_room_id,
        user_id,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteChattingRoom', () => {
    it('채팅방을 삭제해야 함', async () => {
      const id = 1;
      const expectedResult = { affected: 1 };

      mockChattingRoomRepository.delete.mockResolvedValue(expectedResult);

      const result = await repository.deleteChattingRoom(id);

      expect(mockChattingRoomRepository.delete).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findChattingRoom', () => {
    it('모든 채팅방을 조회해야 함', async () => {
      const id = 1;
      const expectedResult = [
        { id: 1, title: '채팅방1' },
        { id: 2, title: '채팅방2' },
      ];

      mockChattingRoomRepository.find.mockResolvedValue(expectedResult);

      const result = await repository.findChattingRoom(id);

      expect(mockChattingRoomRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findChattingRoomById', () => {
    it('ID로 특정 채팅방을 조회해야 함', async () => {
      const id = 1;
      const expectedResult = { id, title: '테스트 채팅방' };

      mockChattingRoomRepository.findOne.mockResolvedValue(expectedResult);

      const result = await repository.findChattingRoomById(id);

      expect(mockChattingRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findId', () => {
    it('ID로 사용자를 조회해야 함', async () => {
      const id = 1;
      const expectedResult = { id, nickname: '테스트유저' };

      mockUserRepository.findOne.mockResolvedValue(expectedResult);

      const result = await repository.findId(id);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('checkChattingRoom', () => {
    it('채팅방이 존재하는지 확인해야 함', async () => {
      const id = 1;
      const expectedResult = { id, title: '테스트 채팅방' };

      mockChattingRoomRepository.findOne.mockResolvedValue(expectedResult);

      const result = await repository.checkChattingRoom(id);

      expect(mockChattingRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addChatMemberNotAdmin', () => {
    it('관리자 권한 없이 채팅방 멤버를 추가해야 함', async () => {
      const chatting_room_id = 1;
      const user_id = 1;
      const expectedResult = { chatting_room_id, user_id, admin: false };

      mockChatMemberRepository.save.mockResolvedValue(expectedResult);

      const result = await repository.addChatMemberNotAdmin(
        chatting_room_id,
        user_id,
      );

      expect(mockChatMemberRepository.save).toHaveBeenCalledWith({
        chatting_room_id,
        user_id,
        admin: false,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByNickname', () => {
    it('닉네임으로 사용자를 찾아야 함', async () => {
      const nickname = '테스트유저';
      const expectedResult = { id: 1, nickname };

      mockDataSource.getRepository().findOne.mockResolvedValue(expectedResult);

      const result = await repository.findByNickname(nickname);

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(User);
      expect(mockDataSource.getRepository().findOne).toHaveBeenCalledWith({
        where: { nickname },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
