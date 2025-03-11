import { Test, TestingModule } from '@nestjs/testing';
import { DirectionController } from './direction.controller';
import { DirectionService } from './direction.service';
import { Socket } from 'socket.io';
import { UserGuard } from 'src/user/guards/user-guard';

// Mock DirectionService
const mockDirectionService = {
  createBookmarks: jest.fn(), // createBookmarks 메서드 모킹
  compareBookmark: jest.fn(), // compareBookmark 메서드 모킹
};

// Mock UserGuard
const mockUserGuard = {
  canActivate: jest.fn().mockReturnValue(true), // 항상 인증 성공
};

// Mock Socket client
const mockClient: Partial<Socket> = {
  emit: jest.fn(),
};

describe('DirectionController', () => {
  let controller: DirectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectionController],
      providers: [
        { provide: DirectionService, useValue: mockDirectionService },
      ],
    })
      // 실제 UserGuard 대신 mockUserGuard를 사용하도록 override
      .overrideGuard(UserGuard)
      .useValue(mockUserGuard)
      .compile();

    controller = module.get<DirectionController>(DirectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllSubAchievements', () => {
    it('should return all bookmarks', async () => {
      const result = [{ id: 1, title: 'Bookmark 1' }];
      mockDirectionService.createBookmarks.mockResolvedValue(result);

      const response = await controller.getAllSubAchievements();
      expect(response).toBe(result);
    });
  });

  describe('compareBookmark', () => {
    it('should compare bookmark with user direction', async () => {
      // 모킹된 요청과 방향 데이터
      const req = { user: { id: 1 } };
      const compareDirection = {
        user_direction: { latitude: 37.123, longitude: 127.456 },
      };
      const result = {
        triggered: true,
        bookmark: { id: 1, title: 'Bookmark 1' },
      };

      // compareBookmark 메서드 모킹 응답 설정
      mockDirectionService.compareBookmark.mockResolvedValue(result);

      // 엔드포인트 호출
      const response = await controller.compareBookmark(
        req,
        compareDirection,
        mockClient as Socket,
      );

      // 검증
      expect(response).toBe(result);
      expect(mockDirectionService.compareBookmark).toHaveBeenCalledWith(
        req.user.id,
        compareDirection.user_direction.latitude,
        compareDirection.user_direction.longitude,
        mockClient,
      );
    });
  });
});
