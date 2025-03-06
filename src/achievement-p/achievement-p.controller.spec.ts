import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPController } from './achievement-p.controller';
import { AchievementPService } from './achievement-p.service';
import { UserGuard } from '../user/guards/user-guard';

describe('AchievementPController', () => {
  let controller: AchievementPController;
  let service: AchievementPService;

  const mockAchievementP = {
    id: 1,
    user_id: 1,
    sub_achievement_id: 1,
    complete: true,
  };

  const mockService = {
    post: jest.fn(),
    deleteByUserNSub: jest.fn(),
    deleteByPId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementPController],
      providers: [
        { provide: AchievementPService, useValue: mockService },
        {
          provide: UserGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AchievementPController>(AchievementPController);
    service = module.get<AchievementPService>(AchievementPService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('post', () => {
    it('should create an AchievementP', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = 1;
      mockService.post.mockResolvedValue(mockAchievementP);

      const result = await controller.post(req, subAchievementId);

      expect(result).toEqual(mockAchievementP);
      expect(mockService.post).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('deleteByUserNSub', () => {
    it('should delete an AchievementP by user and sub-achievement', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = 1;
      mockService.deleteByUserNSub.mockResolvedValue({ message: '삭제 완료' });

      const result = await controller.deleteByUserNSub(req, subAchievementId);

      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockService.deleteByUserNSub).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('deleteByPId', () => {
    it('should delete an AchievementP by ID', async () => {
      const req = { user: { id: 1 } };
      const achievementPId = '1';
      mockService.deleteByPId.mockResolvedValue({ message: '삭제 완료' });

      const result = await controller.deleteByPId(req, achievementPId);

      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockService.deleteByPId).toHaveBeenCalledWith('1');
    });
  });
});
