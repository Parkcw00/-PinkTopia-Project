import { Test, TestingModule } from '@nestjs/testing';
import { ChatmemberGateway } from './chatmember.gateway';
import { ChatmemberService } from './chatmember.service';
import { ChattingGateway } from '../chatting/chatting.gateway';
import { Socket, Server } from 'socket.io';

describe('ChatmemberGateway', () => {
  let gateway: ChatmemberGateway;
  let chatmemberService: ChatmemberService;

  const mockChatmemberService = {
    createChatmember: jest.fn(),
    findAllChatMember: jest.fn(),
    findOneChatMember: jest.fn(),
    deleteChatMember: jest.fn(),
  };

  const mockChattingGateway = {
    server: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
  };

  const mockSocket: Partial<Socket> = {
    emit: jest.fn(),
  };

  const mockServer: Partial<Server> = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatmemberGateway,
        {
          provide: ChatmemberService,
          useValue: mockChatmemberService,
        },
        {
          provide: ChattingGateway,
          useValue: mockChattingGateway,
        },
      ],
    }).compile();

    gateway = module.get<ChatmemberGateway>(ChatmemberGateway);
    chatmemberService = module.get<ChatmemberService>(ChatmemberService);
    gateway.server = mockServer as Server;
  });

  it('게이트웨이가 정의되어 있어야 합니다', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleCreateChatmember', () => {
    it('채팅멤버를 생성하고 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        createChatmemberDto: {
          chatting_room_id: 1,
          admin: false,
        },
      };

      const mockCreatedMember = {
        id: 1,
        user_id: 1,
        chatting_room_id: 1,
        admin: false,
      };

      mockChatmemberService.createChatmember.mockResolvedValue(mockCreatedMember);
      mockChatmemberService.findAllChatMember.mockResolvedValue([mockCreatedMember]);

      await gateway.handleCreateChatmember(mockData, mockSocket as Socket);

      expect(mockChatmemberService.createChatmember).toHaveBeenCalledWith(
        mockData.userId,
        mockData.createChatmemberDto,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('chatmemberCreated', mockCreatedMember);
      expect(mockServer.emit).toHaveBeenCalledWith('allChatMembers', [mockCreatedMember]);
    });

    it('에러 발생 시 에러 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        createChatmemberDto: {
          chatting_room_id: 1,
          admin: false,
        },
      };

      mockChatmemberService.createChatmember.mockRejectedValue(new Error('Test error'));

      await gateway.handleCreateChatmember(mockData, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to create chatmember',
      });
    });
  });

  describe('handleFindAllChatMember', () => {
    it('모든 채팅멤버를 조회하고 이벤트를 발생시켜야 합니다', async () => {
      const mockMembers = [
        { id: 1, user_id: 1, chatting_room_id: 1, admin: false },
      ];

      mockChatmemberService.findAllChatMember.mockResolvedValue(mockMembers);

      await gateway.handleFindAllChatMember(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('allChatMembers', mockMembers);
    });
  });

  describe('handleTemporaryLeave', () => {
    it('임시 퇴장 시 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        roomId: 1,
        nickname: 'tester',
      };

      await gateway.handleTemporaryLeave(mockData, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('userLeft', {
        userId: mockData.userId,
        roomId: mockData.roomId,
        nickname: mockData.nickname,
      });
    });
  });

  describe('handlePermanentLeave', () => {
    it('영구 퇴장 시 멤버를 삭제하고 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        roomId: 1,
        nickname: 'tester',
      };

      const mockDeleteResponse = { message: '채팅방에서 나갔습니다.' };
      mockChatmemberService.deleteChatMember.mockResolvedValue(mockDeleteResponse);
      mockChatmemberService.findAllChatMember.mockResolvedValue([]);

      await gateway.handlePermanentLeave(mockData, mockSocket as Socket);

      expect(mockChatmemberService.deleteChatMember).toHaveBeenCalledWith(
        mockData.userId,
        mockData.roomId,
      );
      expect(mockChattingGateway.server.to).toHaveBeenCalledWith(`room_${mockData.roomId}`);
      expect(mockChattingGateway.server.to().emit).toHaveBeenCalledWith('message', {
        type: 'system',
        roomId: mockData.roomId,
        message: `${mockData.nickname}님이 채팅방을 완전히 나가셨습니다.`,
        timestamp: expect.any(Date),
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('chatmemberDeleted', {
        userId: mockData.userId,
        roomId: mockData.roomId,
      });
      expect(mockServer.emit).toHaveBeenCalledWith('allChatMembers', []);
    });
  });
});
