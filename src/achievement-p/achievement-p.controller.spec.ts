import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPController } from './achievement-p.controller';
import { AchievementPService } from './achievement-p.service';

describe('AchievementPController', () => {
  let controller: AchievementPController;
  let service: AchievementPService;

  // 서비스의 메소드를 모의하여 컨트롤러의 동작만 검증합니다.
  const mockService = {
    fillValkey: jest.fn(),
    post: jest.fn(),
    deleteByUserNSub: jest.fn(),
    deleteByPId: jest.fn(),
  };

  beforeEach(async () => {
    // 테스트 모듈 생성 시 컨트롤러와 모의 서비스를 주입합니다.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementPController],
      providers: [
        { provide: AchievementPService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AchievementPController>(AchievementPController);
    service = module.get<AchievementPService>(AchievementPService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // fillValkey 엔드포인트에 대한 테스트
  describe('fillValkey', () => {
    it('req.user.id를 전달하여 service.fillValkey가 호출되어야 함', async () => {
      const req = { user: { id: 1 } };
      const expected = { message: '테스트 메시지' };
      mockService.fillValkey.mockResolvedValue(expected);

      const result = await controller.fillValkey(req);
      expect(service.fillValkey).toHaveBeenCalledWith(1);
      expect(result).toEqual(expected);
    });
  });

  // post 엔드포인트에 대한 테스트
  describe('post', () => {
    it('req.user.id와 subAchievementId를 전달하여 service.post가 호출되어야 함', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = '101';
      const expected = { id: 1 };
      mockService.post.mockResolvedValue(expected);

      const result = await controller.post(req, subAchievementId);
      expect(service.post).toHaveBeenCalledWith(1, subAchievementId);
      expect(result).toEqual(expected);
    });
  });

  // deleteByUserNSub 엔드포인트에 대한 테스트
  describe('deleteByUserNSub', () => {
    it('req.user.id와 subAchievementId를 전달하여 service.deleteByUserNSub가 호출되어야 함', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = '101';
      const expected = { message: '삭제 완료' };
      mockService.deleteByUserNSub.mockResolvedValue(expected);

      const result = await controller.deleteByUserNSub(req, subAchievementId);
      expect(service.deleteByUserNSub).toHaveBeenCalledWith(1, subAchievementId);
      expect(result).toEqual(expected);
    });
  });

  // deleteByPId 엔드포인트에 대한 테스트
  describe('deleteByPId', () => {
    it('achievementPId를 전달하여 service.deleteByPId가 호출되어야 함', async () => {
      const req = { user: { id: 1 } }; // req는 사용되지 않음
      const achievementPId = '1';
      const expected = { message: '삭제 완료' };
      mockService.deleteByPId.mockResolvedValue(expected);

      const result = await controller.deleteByPId(req, achievementPId);
      expect(service.deleteByPId).toHaveBeenCalledWith(achievementPId);
      expect(result).toEqual(expected);
    });
  });
});
