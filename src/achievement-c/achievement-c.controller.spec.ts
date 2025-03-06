import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCController } from './achievement-c.controller';
import { AchievementCService } from './achievement-c.service';

describe('AchievementCController', () => {
  let controller: AchievementCController;
  let service: AchievementCService;

  // AchievementCService의 각 메서드를 모킹하여 컨트롤러의 동작만 검증
  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    // 테스트 모듈 생성 시 컨트롤러와 모킹한 서비스를 주입
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementCController],
      providers: [
        {
          provide: AchievementCService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AchievementCController>(AchievementCController);
    service = module.get<AchievementCService>(AchievementCService);
  });

  afterEach(() => {
    // 각 테스트 후 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('올바른 DTO를 전달하면 service.create를 호출하고 결과를 반환해야 한다', async () => {
      const dto = { user_id: 1, achievement_id: 1 };
      const expectedResult = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expectedResult);

      // 컨트롤러의 create 메서드는 Request 객체와 DTO를 받음 (여기서는 Request는 단순 객체로 대체)
      const result = await controller.create({ user: { id: 1 } }, dto);
      expect(result).toEqual(expectedResult);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('achievementCId를 전달받아 service.findOne을 호출하고 결과를 반환해야 한다', async () => {
      const achievementCId = '1';
      const expectedResult = { 'Test Achievement': [{ id: 1, name: 'SubAchievement1' }] };
      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(achievementCId);
      expect(result).toEqual(expectedResult);
      expect(mockService.findOne).toHaveBeenCalledWith(achievementCId);
    });
  });

  describe('find', () => {
    it('service.findAll을 호출하여 모든 업적 데이터를 반환해야 한다', async () => {
      const achievements = [{ id: 1 }, { id: 2 }];
      mockService.findAll.mockResolvedValue(achievements);

      const result = await controller.find();
      expect(result).toEqual(achievements);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('achievementCId를 전달받아 service.remove를 호출하고 결과를 반환해야 한다', async () => {
      const achievementCId = '1';
      const expectedResult = { message: '삭제 성공' };
      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(achievementCId);
      expect(result).toEqual(expectedResult);
      expect(mockService.remove).toHaveBeenCalledWith(achievementCId);
    });
  });
});
