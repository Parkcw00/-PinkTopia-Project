import { Test, TestingModule } from '@nestjs/testing';
import { ChattingRoomService } from './chattingroom.service';
import { ChattingRoomRepository } from './chattingroom.repository';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChattingRoomDto } from './dto/create-chattingroom.dto';

describe('ChattingRoomService', () => {
  let service: ChattingRoomService;
  let chattingRoomRepository: ChattingRoomRepository;
  let configService: ConfigService;
  let dataSource: DataSource;

  const mockChattingRoomRepository = {
    createChattingRoom: jest.fn(),
    addChatMember: jest.fn(),
    findChatMemberByUserId: jest.fn(),
    findChattingRoomById: jest.fn(),
    findAllChatMembers: jest.fn(),
    findId: jest.fn(),
    findChatMember: jest.fn(),
    getAdmin: jest.fn(),
    deleteAdmin: jest.fn(),
    deleteChattingRoom: jest.fn(),
    checkChattingRoom: jest.fn(),
    addChatMemberNotAdmin: jest.fn(),
    findByNickname: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockDataSource = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingRoomService,
        {
          provide: ChattingRoomRepository,
          useValue: mockChattingRoomRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ChattingRoomService>(ChattingRoomService);
    chattingRoomRepository = module.get<ChattingRoomRepository>(
      ChattingRoomRepository,
    );
    configService = module.get<ConfigService>(ConfigService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChattingRoom', () => {
    it('채팅방을 생성하고 사용자를 관리자로 추가해야 함', async () => {
      const user = { id: 1 };
      const createChattingRoomDto: CreateChattingRoomDto = {
        title: '테스트 채팅방',
      };
      const mockChattingRoom = { id: 1, title: '테스트 채팅방' };
      const mockChatMember = {
        id: 1,
        user_id: 1,
        chatting_room_id: 1,
        admin: true,
      };

      mockChattingRoomRepository.createChattingRoom.mockResolvedValue(
        mockChattingRoom,
      );
      mockChattingRoomRepository.addChatMember.mockResolvedValue(
        mockChatMember,
      );

      const result = await service.createChattingRoom(
        user,
        createChattingRoomDto,
      );

      expect(
        mockChattingRoomRepository.createChattingRoom,
      ).toHaveBeenCalledWith(createChattingRoomDto);
      expect(mockChattingRoomRepository.addChatMember).toHaveBeenCalledWith(
        mockChattingRoom.id,
        user.id,
      );
      expect(result).toEqual({
        message: '채팅방이 생성되었습니다.',
        id: mockChattingRoom.id,
      });
    });
  });

  describe('getChattingRoom', () => {
    it('사용자가 속한 채팅방 목록을 반환해야 함', async () => {
      const user = { id: 1 };
      const mockChatMembers = [
        { chatting_room_id: 1, user_id: 1 },
        { chatting_room_id: 2, user_id: 1 },
      ];
      const mockChattingRooms = [
        { id: 1, title: '채팅방 1' },
        { id: 2, title: '채팅방 2' },
      ];
      const mockMembers = [
        [
          { user_id: 1, admin: true },
          { user_id: 2, admin: false },
        ],
        [
          { user_id: 1, admin: true },
          { user_id: 3, admin: false },
        ],
      ];
      const mockUsers = [
        { id: 1, nickname: '사용자1' },
        { id: 2, nickname: '사용자2' },
        { id: 3, nickname: '사용자3' },
      ];

      mockChattingRoomRepository.findChatMemberByUserId.mockResolvedValue(
        mockChatMembers,
      );
      mockChattingRoomRepository.findChattingRoomById.mockImplementation(
        (id) => {
          return Promise.resolve(
            mockChattingRooms.find((room) => room.id === id),
          );
        },
      );
      mockChattingRoomRepository.findAllChatMembers.mockImplementation((id) => {
        return Promise.resolve(mockMembers[id - 1]);
      });
      mockChattingRoomRepository.findId.mockImplementation((id) => {
        return Promise.resolve(mockUsers.find((user) => user.id === id));
      });

      const result = await service.getChattingRoom(user);

      expect(
        mockChattingRoomRepository.findChatMemberByUserId,
      ).toHaveBeenCalledWith(user.id);
      expect(result).toHaveProperty('message', '채팅방 목록입니다.');
      expect(result).toHaveProperty('chattingRooms');
      expect(result.chattingRooms).toHaveLength(2);
      expect(result.chattingRooms[0]).toHaveProperty('id', 1);
      expect(result.chattingRooms[0]).toHaveProperty('title', '채팅방 1');
      expect(result.chattingRooms[0]).toHaveProperty('members');
    });
  });

  describe('outChattingRoom', () => {
    it('채팅방을 나갈 수 있어야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const mockChatMember = { user_id: 1, chatting_room_id: 1, admin: false };

      mockChattingRoomRepository.findChatMember.mockResolvedValue(
        mockChatMember,
      );

      const result = await service.outChattingRoom(user, chattingRoomId);

      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(result).toEqual({ message: '채팅방을 나가셨습니다.' });
    });

    it('관리자가 채팅방을 나갈 때 다른 멤버에게 관리자 권한을 위임해야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const mockChatMember = { user_id: 1, chatting_room_id: 1, admin: true };
      const mockMembers = [
        { user_id: 1, admin: true },
        { user_id: 2, admin: false },
      ];

      mockChattingRoomRepository.findChatMember.mockResolvedValue(
        mockChatMember,
      );
      mockChattingRoomRepository.findAllChatMembers.mockResolvedValue(
        mockMembers,
      );
      mockChattingRoomRepository.getAdmin.mockResolvedValue({ affected: 1 });

      const result = await service.outChattingRoom(user, chattingRoomId);

      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(
        mockChattingRoomRepository.findAllChatMembers,
      ).toHaveBeenCalledWith(chattingRoomId);
      expect(mockChattingRoomRepository.getAdmin).toHaveBeenCalledWith(
        chattingRoomId,
        2,
      );
      expect(result).toEqual({ message: '채팅방을 나가셨습니다.' });
    });
  });

  describe('deleteChattingRoom', () => {
    it('관리자는 채팅방을 삭제할 수 있어야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const mockChatMember = { user_id: 1, chatting_room_id: 1, admin: true };

      mockChattingRoomRepository.findChatMember.mockResolvedValue(
        mockChatMember,
      );
      mockChattingRoomRepository.deleteChattingRoom.mockResolvedValue({
        affected: 1,
      });

      const result = await service.deleteChattingRoom(user, chattingRoomId);

      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(
        mockChattingRoomRepository.deleteChattingRoom,
      ).toHaveBeenCalledWith(chattingRoomId);
      expect(result).toEqual({ message: '채팅방이 삭제되었습니다.' });
    });
  });

  describe('changeAdmin', () => {
    it('관리자는 다른 멤버에게 관리자 권한을 위임할 수 있어야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const userId = 2;
      const mockChatMember1 = { user_id: 1, chatting_room_id: 1, admin: true };
      const mockChatMember2 = { user_id: 2, chatting_room_id: 1, admin: false };

      mockChattingRoomRepository.findChatMember.mockImplementation(
        (roomId, uId) => {
          if (uId === 1) return Promise.resolve(mockChatMember1);
          if (uId === 2) return Promise.resolve(mockChatMember2);
          return Promise.resolve(null);
        },
      );
      mockChattingRoomRepository.deleteAdmin.mockResolvedValue({ affected: 1 });
      mockChattingRoomRepository.getAdmin.mockResolvedValue({ affected: 1 });

      const result = await service.changeAdmin(user, chattingRoomId, userId);

      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        userId,
      );
      expect(mockChattingRoomRepository.deleteAdmin).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(mockChattingRoomRepository.getAdmin).toHaveBeenCalledWith(
        chattingRoomId,
        userId,
      );
      expect(result).toEqual({
        message: `${userId}님에게 관리자 권한을 위임하였습니다.`,
      });
    });
  });

  describe('sendInviteUrl', () => {
    it('채팅방 초대 URL을 다른 사용자에게 전송할 수 있어야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const receiveUserId = '사용자2';
      const mockChatMember = { user_id: 1, chatting_room_id: 1, admin: true };
      const mockReceiveUser = {
        id: 2,
        nickname: '사용자2',
        email: 'user2@example.com',
      };
      const mockSendUser = {
        id: 1,
        nickname: '사용자1',
        email: 'user1@example.com',
      };

      mockChattingRoomRepository.findChatMember.mockImplementation(
        (roomId, uId) => {
          if (uId === 1) return Promise.resolve(mockChatMember);
          return Promise.resolve(null);
        },
      );
      mockChattingRoomRepository.findByNickname.mockResolvedValue(
        mockReceiveUser,
      );
      mockChattingRoomRepository.findId.mockResolvedValue(mockSendUser);

      // Mock sendEmail method
      jest.spyOn(service as any, 'sendEmail').mockResolvedValue(undefined);

      const result = await service.sendInviteUrl(
        user,
        chattingRoomId,
        receiveUserId,
      );

      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(mockChattingRoomRepository.findByNickname).toHaveBeenCalledWith(
        receiveUserId,
      );
      expect(mockChattingRoomRepository.findId).toHaveBeenCalledWith(user.id);
      expect(service['sendEmail']).toHaveBeenCalledWith(
        mockReceiveUser.email,
        mockSendUser.nickname,
        mockReceiveUser.nickname,
        chattingRoomId,
      );
      expect(result).toEqual({ message: '초대 메일을 발송하였습니다.' });
    });
  });

  describe('joinChattingRoom', () => {
    it('초대 URL을 통해 채팅방에 참여할 수 있어야 함', async () => {
      const user = { id: 1 };
      const chattingRoomId = 1;
      const mockChattingRoom = { id: 1, title: '테스트 채팅방' };

      mockChattingRoomRepository.checkChattingRoom.mockResolvedValue(
        mockChattingRoom,
      );
      mockChattingRoomRepository.findChatMember.mockResolvedValue(null); // 아직 멤버가 아님
      mockChattingRoomRepository.addChatMemberNotAdmin.mockResolvedValue({
        id: 1,
        user_id: 1,
        chatting_room_id: 1,
        admin: false,
      });

      const result = await service.joinChattingRoom(user, chattingRoomId);

      expect(mockChattingRoomRepository.checkChattingRoom).toHaveBeenCalledWith(
        chattingRoomId,
      );
      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        user.id,
      );
      expect(
        mockChattingRoomRepository.addChatMemberNotAdmin,
      ).toHaveBeenCalledWith(chattingRoomId, user.id);
      expect(result).toEqual({ message: '채팅방 멤버가 되었습니다.' });
    });
  });

  describe('checkChatMember', () => {
    it('채팅방 멤버 정보를 확인할 수 있어야 함', async () => {
      const userId = 1;
      const chattingRoomId = 1;
      const mockChattingRoom = { id: 1, title: '테스트 채팅방' };
      const mockChatMember = { user_id: 1, chatting_room_id: 1, admin: true };
      const mockAllMembers = [
        { user_id: 1, admin: true },
        { user_id: 2, admin: false },
      ];

      mockChattingRoomRepository.checkChattingRoom.mockResolvedValue(
        mockChattingRoom,
      );
      mockChattingRoomRepository.findChatMember.mockResolvedValue(
        mockChatMember,
      );
      mockChattingRoomRepository.findAllChatMembers.mockResolvedValue(
        mockAllMembers,
      );

      const result = await service.checkChatMember(userId, chattingRoomId);

      expect(mockChattingRoomRepository.checkChattingRoom).toHaveBeenCalledWith(
        chattingRoomId,
      );
      expect(mockChattingRoomRepository.findChatMember).toHaveBeenCalledWith(
        chattingRoomId,
        userId,
      );
      expect(
        mockChattingRoomRepository.findAllChatMembers,
      ).toHaveBeenCalledWith(chattingRoomId);
      expect(result).toEqual({
        success: true,
        data: {
          member: {
            id: mockChatMember.user_id,
            isAdmin: mockChatMember.admin,
          },
          allMembers: mockAllMembers.map((member) => ({
            id: member.user_id,
            isAdmin: member.admin,
          })),
        },
      });
    });
  });

  describe('findChattingRoomById', () => {
    it('특정 채팅방을 ID로 조회할 수 있어야 함', async () => {
      const id = 1;
      const mockChattingRoom = { id: 1, title: '테스트 채팅방' };

      mockChattingRoomRepository.findChattingRoomById.mockResolvedValue(
        mockChattingRoom,
      );

      const result = await service.findChattingRoomById(id);

      expect(
        mockChattingRoomRepository.findChattingRoomById,
      ).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockChattingRoom);
    });

    it('존재하지 않는 채팅방을 조회하면 NotFoundException을 던져야 함', async () => {
      const id = 999;

      mockChattingRoomRepository.findChattingRoomById.mockResolvedValue(null);

      await expect(service.findChattingRoomById(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockChattingRoomRepository.findChattingRoomById,
      ).toHaveBeenCalledWith(id);
    });
  });
});
