import { Test, TestingModule } from '@nestjs/testing';
import { ChattingRoomController } from './chattingroom.controller';
import { ChattingRoomService } from './chattingroom.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateChattingRoomDto } from './dto/create-chattingroom.dto';
import { ChangeAdmin } from './dto/change-admin.dto';
import { InviteUser } from './dto/invite-user.dto';
import { UserGuard } from '../user/guards/user-guard';

describe('ChattingRoomController', () => {
  let controller: ChattingRoomController;
  let service: ChattingRoomService;

  const mockChattingRoomService = {
    createChattingRoom: jest.fn(),
    getChattingRoom: jest.fn(),
    outChattingRoom: jest.fn(),
    deleteChattingRoom: jest.fn(),
    changeAdmin: jest.fn(),
    sendInviteUrl: jest.fn(),
    joinChattingRoom: jest.fn(),
    checkChatMember: jest.fn(),
    findChattingRoomById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChattingRoomController],
      providers: [
        {
          provide: ChattingRoomService,
          useValue: mockChattingRoomService,
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ChattingRoomController>(ChattingRoomController);
    service = module.get<ChattingRoomService>(ChattingRoomService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createChattingRoom', () => {
    it('채팅방을 생성할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const createChattingRoomDto: CreateChattingRoomDto = {
        title: '테스트 채팅방',
      };
      const expectedResult = { message: '채팅방이 생성되었습니다.', id: 1 };

      mockChattingRoomService.createChattingRoom.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.createChattingRoom(
        req,
        createChattingRoomDto,
      );

      expect(mockChattingRoomService.createChattingRoom).toHaveBeenCalledWith(
        req.user,
        createChattingRoomDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getChattingRoom', () => {
    it('사용자의 채팅방 목록을 조회할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const expectedResult = {
        message: '채팅방 목록입니다.',
        chattingRooms: [
          { id: 1, title: '채팅방 1', members: '사용자1, 사용자2' },
          { id: 2, title: '채팅방 2', members: '사용자1, 사용자3' },
        ],
      };

      mockChattingRoomService.getChattingRoom.mockResolvedValue(expectedResult);

      const result = await controller.getChattingRoom(req);

      expect(mockChattingRoomService.getChattingRoom).toHaveBeenCalledWith(
        req.user,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('outChattingRoom', () => {
    it('채팅방을 나갈 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = 1;
      const expectedResult = { message: '채팅방을 나가셨습니다.' };

      mockChattingRoomService.outChattingRoom.mockResolvedValue(expectedResult);

      const result = await controller.outChattingRoom(req, chattingRoomId);

      expect(mockChattingRoomService.outChattingRoom).toHaveBeenCalledWith(
        req.user,
        chattingRoomId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteChattingRoom', () => {
    it('채팅방을 삭제할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = 1;
      const expectedResult = { message: '채팅방이 삭제되었습니다.' };

      mockChattingRoomService.deleteChattingRoom.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.deleteChattingRoom(req, chattingRoomId);

      expect(mockChattingRoomService.deleteChattingRoom).toHaveBeenCalledWith(
        req.user,
        chattingRoomId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changeAdmin', () => {
    it('관리자 권한을 위임할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = 1;
      const changeAdmin: ChangeAdmin = { userId: 2 };
      const expectedResult = {
        message: '2님에게 관리자 권한을 위임하였습니다.',
      };

      mockChattingRoomService.changeAdmin.mockResolvedValue(expectedResult);

      const result = await controller.changeAdmin(
        req,
        chattingRoomId,
        changeAdmin,
      );

      expect(mockChattingRoomService.changeAdmin).toHaveBeenCalledWith(
        req.user,
        chattingRoomId,
        changeAdmin.userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('sendInviteUrl', () => {
    it('채팅방 초대 URL을 전송할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = 1;
      const inviteUser: InviteUser = { nickname: '사용자2' };
      const expectedResult = { message: '초대 메일을 발송하였습니다.' };

      mockChattingRoomService.sendInviteUrl.mockResolvedValue(expectedResult);

      const result = await controller.sendInviteUrl(
        req,
        chattingRoomId,
        inviteUser,
      );

      expect(mockChattingRoomService.sendInviteUrl).toHaveBeenCalledWith(
        req.user,
        chattingRoomId,
        inviteUser.nickname,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('joinChattingRoom', () => {
    it('채팅방에 참여할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = 1;
      const expectedResult = { message: '채팅방 멤버가 되었습니다.' };

      mockChattingRoomService.joinChattingRoom.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.joinChattingRoom(req, chattingRoomId);

      expect(mockChattingRoomService.joinChattingRoom).toHaveBeenCalledWith(
        req.user,
        chattingRoomId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('checkChatMember', () => {
    it('채팅방 멤버 정보를 확인할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const chattingRoomId = '1';
      const expectedResult = {
        success: true,
        data: {
          member: { id: 1, isAdmin: true },
          allMembers: [
            { id: 1, isAdmin: true },
            { id: 2, isAdmin: false },
          ],
        },
      };

      mockChattingRoomService.checkChatMember.mockResolvedValue(expectedResult);

      const result = await controller.checkChatMember(req, chattingRoomId);

      expect(mockChattingRoomService.checkChatMember).toHaveBeenCalledWith(
        req.user.id,
        parseInt(chattingRoomId),
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getChattingRoomById', () => {
    it('특정 채팅방을 ID로 조회할 수 있어야 함', async () => {
      const req = { user: { id: 1 } };
      const id = 1;
      const mockChattingRoom = { id: 1, title: '테스트 채팅방' };
      const expectedResult = {
        success: true,
        data: mockChattingRoom,
      };

      mockChattingRoomService.findChattingRoomById.mockResolvedValue(
        mockChattingRoom,
      );

      const result = await controller.getChattingRoomById(req, id);

      expect(mockChattingRoomService.findChattingRoomById).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(expectedResult);
    });

    it('존재하지 않는 채팅방을 조회하면 NotFoundException을 던져야 함', async () => {
      const req = { user: { id: 1 } };
      const id = 999;

      mockChattingRoomService.findChattingRoomById.mockRejectedValue(
        new NotFoundException('존재하지 않는 채팅방입니다.'),
      );

      await expect(controller.getChattingRoomById(req, id)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockChattingRoomService.findChattingRoomById).toHaveBeenCalledWith(
        id,
      );
    });
  });
});
