import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistGateway } from './chatblacklist.gateway';
import { ChatblacklistService } from './chatblacklist.service';
import { Socket, Server } from 'socket.io';

describe('ChatblacklistGateway', () => {
  let gateway: ChatblacklistGateway;
  let chatblacklistService: ChatblacklistService;

  const mockChatblacklistService = {
    createChatblacklist: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
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
        ChatblacklistGateway,
        {
          provide: ChatblacklistService,
          useValue: mockChatblacklistService,
        },
      ],
    }).compile();

    gateway = module.get<ChatblacklistGateway>(ChatblacklistGateway);
    chatblacklistService = module.get<ChatblacklistService>(ChatblacklistService);
    gateway.server = mockServer as Server;
  });

  it('게이트웨이가 정의되어 있어야 합니다', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleCreateBlacklist', () => {
    it('블랙리스트를 생성하고 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        createChatblacklistDto: {
          user_id: 2,
          chatting_room_id: 1,
        },
      };

      const mockBlacklist = {
        id: 1,
        user_id: 2,
        chatting_room_id: 1,
      };

      mockChatblacklistService.createChatblacklist.mockResolvedValue(mockBlacklist);
      mockChatblacklistService.findAll.mockResolvedValue([mockBlacklist]);

      await gateway.handleCreateBlacklist(mockData, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('blacklistCreated', mockBlacklist);
      expect(mockServer.emit).toHaveBeenCalledWith('allBlacklists', [mockBlacklist]);
    });

    it('에러 발생 시 에러 이벤트를 발생시켜야 합니다', async () => {
      const mockData = {
        userId: 1,
        createChatblacklistDto: {
          user_id: 2,
          chatting_room_id: 1,
        },
      };

      mockChatblacklistService.createChatblacklist.mockRejectedValue(new Error('Test error'));

      await gateway.handleCreateBlacklist(mockData, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to create blacklist',
      });
    });
  });

  describe('handleFindAllBlacklist', () => {
    it('모든 블랙리스트를 조회하고 이벤트를 발생시켜야 합니다', async () => {
      const mockBlacklists = [
        { id: 1, user_id: 2, chatting_room_id: 1 },
      ];

      mockChatblacklistService.findAll.mockResolvedValue(mockBlacklists);

      await gateway.handleFindAllBlacklist(mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('allBlacklists', mockBlacklists);
    });
  });

  describe('handleRemoveBlacklist', () => {
    it('블랙리스트를 삭제하고 이벤트를 발생시켜야 합니다', async () => {
      const mockData = { blacklistId: 1 };
      const mockBlacklists = [];

      mockChatblacklistService.remove.mockResolvedValue({ affected: 1 });
      mockChatblacklistService.findAll.mockResolvedValue(mockBlacklists);

      await gateway.handleRemoveBlacklist(mockData, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('blacklistRemoved', { blacklistId: 1 });
      expect(mockServer.emit).toHaveBeenCalledWith('allBlacklists', mockBlacklists);
    });
  });
});
