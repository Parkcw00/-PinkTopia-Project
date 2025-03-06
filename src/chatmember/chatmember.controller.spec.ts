import { Test, TestingModule } from '@nestjs/testing';
import { ChatmemberController } from './chatmember.controller';
import { ChatmemberService } from './chatmember.service';
import { UserGuard } from '../user/guards/user-guard';

describe('ChatmemberController', () => {
  let controller: ChatmemberController;
  let service: ChatmemberService;

  const mockChatmemberService = {
    createChatmember: jest.fn(),
    findAllChatMember: jest.fn(),
    findOneChatMember: jest.fn(),
    deleteChatMember: jest.fn(),
    findByRoomAndUser: jest.fn(),
  };

  const mockChatmember = {
    id: 1,
    user_id: 1,
    chatting_room_id: 1,
    admin: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatmemberController],
      providers: [
        {
          provide: ChatmemberService,
          useValue: mockChatmemberService,
        },
      ],
    })
    .overrideGuard(UserGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ChatmemberController>(ChatmemberController);
    service = module.get<ChatmemberService>(ChatmemberService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('createChatmember', () => {
    it('채팅멤버를 생성해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const createChatmemberDto = {
        chatting_room_id: 1,
        admin: false,
      };

      mockChatmemberService.createChatmember.mockResolvedValue(mockChatmember);

      const result = await controller.createChatmember(mockUser, createChatmemberDto);

      expect(service.createChatmember).toHaveBeenCalledWith(
        mockUser.user.id,
        createChatmemberDto,
      );
      expect(result).toEqual(mockChatmember);
    });
  });

  describe('findAllChatMember', () => {
    it('모든 채팅멤버를 조회해야 합니다', async () => {
      const expectedMembers = [mockChatmember];
      mockChatmemberService.findAllChatMember.mockResolvedValue(expectedMembers);

      const result = await controller.findAllChatMember();

      expect(service.findAllChatMember).toHaveBeenCalled();
      expect(result).toEqual(expectedMembers);
    });
  });

  describe('findOneChatMember', () => {
    it('특정 채팅멤버를 조회해야 합니다', async () => {
      mockChatmemberService.findOneChatMember.mockResolvedValue(mockChatmember);

      const result = await controller.findOneChatMember('1');

      expect(service.findOneChatMember).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockChatmember);
    });
  });

  describe('permanentLeaveRoom', () => {
    it('채팅방을 완전히 나가야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const expectedResponse = { message: '채팅방을 나갔습니다.' };

      mockChatmemberService.deleteChatMember.mockResolvedValue(expectedResponse);

      const result = await controller.permanentLeaveRoom('1', mockUser);

      expect(service.deleteChatMember).toHaveBeenCalledWith(mockUser.user.id, 1);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('checkChatMember', () => {
    it('채팅방 멤버를 확인해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      mockChatmemberService.findByRoomAndUser.mockResolvedValue(mockChatmember);

      const result = await controller.checkChatMember('1', mockUser);

      expect(service.findByRoomAndUser).toHaveBeenCalledWith(1, mockUser.user.id);
      expect(result).toEqual(mockChatmember);
    });
  });
});
