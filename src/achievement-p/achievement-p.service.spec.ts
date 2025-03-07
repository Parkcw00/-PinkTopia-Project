import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPService } from './achievement-p.service';
import { AchievementPRepository } from './achievement-p.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AchievementP } from './entities/achievement-p.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { UpdateResult } from 'typeorm';
describe('AchievementPService', () => {
  let service: AchievementPService;
  let repository: jest.Mocked<AchievementPRepository>;
  let valkeyService: jest.Mocked<ValkeyService>;

  // 각 테스트 케이스 실행 전 모듈 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementPService,
        {
          provide: AchievementPRepository,
          useValue: {
            findSub: jest.fn(),
            findPByUserNSub: jest.fn(),
            createP: jest.fn(),
            save: jest.fn(),
            subAllByA: jest.fn(),
            pAllByA: jest.fn(),
            createC: jest.fn(),
            saveC: jest.fn(),
            reward: jest.fn(),
            gem: jest.fn(),
            dia: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AchievementPService>(AchievementPService);
    repository = module.get<AchievementPRepository>(
      AchievementPRepository,
    ) as jest.Mocked<AchievementPRepository>;
    valkeyService = module.get<ValkeyService>(
      ValkeyService,
    ) as jest.Mocked<ValkeyService>;
  });

  // 각 테스트 후 목업 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 서비스가 정상적으로 정의되었는지 확인
  it('서비스가 정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });

  // post 메서드 테스트
  describe('post', () => {
    it('업적이 완료되지 않은 경우 AchievementP를 성공적으로 생성해야 한다', async () => {
      const userId = 1;
      const subId = 1;
      const mockSubAchievement = {
        id: subId,
        achievement_id: 1,
      } as SubAchievement;
      const mockAchievementP = {
        id: 1,
        user_id: userId,
        sub_achievement_id: subId,
        achievement_id: 1,
        complete: true,
      } as AchievementP;
      const mockSubAchievements = [{ id: 1 }, { id: 2 }] as SubAchievement[];
      const mockPAchievements = [{ sub_achievement_id: 1 }] as AchievementP[];

      repository.findSub.mockResolvedValue(mockSubAchievement);
      repository.findPByUserNSub.mockResolvedValue(null);
      repository.createP.mockResolvedValue(mockAchievementP);
      repository.save.mockResolvedValue(mockAchievementP);
      repository.subAllByA.mockResolvedValue(mockSubAchievements);
      repository.pAllByA.mockResolvedValue(mockPAchievements);

      const result = await service.post(userId, subId);

      expect(repository.findSub).toHaveBeenCalledWith(subId);
      expect(repository.findPByUserNSub).toHaveBeenCalledWith(userId, subId);
      expect(repository.createP).toHaveBeenCalledWith({
        user_id: userId,
        sub_achievement_id: subId,
        achievement_id: mockSubAchievement.achievement_id,
        complete: true,
      });
      expect(repository.save).toHaveBeenCalledWith(mockAchievementP);
      expect(repository.subAllByA).toHaveBeenCalledWith(
        mockSubAchievement.achievement_id,
      );
      expect(repository.pAllByA).toHaveBeenCalledWith(
        mockSubAchievement.achievement_id,
      );
      expect(result).toEqual(mockAchievementP);
    });

    it('업적이 완료되고 보상이 지급되는 경우 AchievementP를 생성해야 한다', async () => {
      const userId = 1;
      const subId = 1;
      const mockSubAchievement = {
        id: subId,
        achievement_id: 1,
      } as SubAchievement;
      const mockAchievementP = {
        id: 1,
        user_id: userId,
        sub_achievement_id: subId,
        achievement_id: 1,
        complete: true,
      } as AchievementP;
      const mockSubAchievements = [{ id: 1 }, { id: 2 }] as SubAchievement[];
      const mockPAchievements = [
        { sub_achievement_id: 1 },
        { sub_achievement_id: 2 },
      ] as AchievementP[];
      const mockAchievementC = {
        id: 1,
        user_id: userId,
        achievement_id: 1,
      } as AchievementC;
      const mockReward = { reward: { gem: 100, dia: 50 } };

      repository.findSub.mockResolvedValue(mockSubAchievement);
      repository.findPByUserNSub.mockResolvedValue(null);
      repository.createP.mockResolvedValue(mockAchievementP);
      repository.save.mockResolvedValue(mockAchievementP);
      repository.subAllByA.mockResolvedValue(mockSubAchievements);
      repository.pAllByA.mockResolvedValue(mockPAchievements);
      repository.createC.mockResolvedValue(mockAchievementC);
      repository.saveC.mockResolvedValue(mockAchievementC);
      repository.reward.mockResolvedValue(mockReward);
      // repository.gem.mockResolvedValue(undefined);
      // repository.dia.mockResolvedValue(undefined);
      repository.gem.mockResolvedValue({ affected: 1 } as UpdateResult);
      repository.dia.mockResolvedValue({ affected: 1 } as UpdateResult);
      const result = await service.post(userId, subId);

      expect(repository.createC).toHaveBeenCalledWith({
        user_id: userId,
        achievement_id: mockSubAchievement.achievement_id,
      });
      expect(repository.saveC).toHaveBeenCalledWith(mockAchievementC);
      expect(repository.reward).toHaveBeenCalledWith(
        mockSubAchievement.achievement_id,
      );
      expect(repository.gem).toHaveBeenCalledWith(userId, 100);
      expect(repository.dia).toHaveBeenCalledWith(userId, 50);
      expect(result).toEqual(mockAchievementP);
    });

    it('AchievementP가 이미 존재하는 경우 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const subId = 1;
      repository.findSub.mockResolvedValue({
        id: subId,
        achievement_id: 1,
      } as SubAchievement);
      repository.findPByUserNSub.mockResolvedValue({ id: 1 } as AchievementP);

      await expect(service.post(userId, subId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findPByUserNSub).toHaveBeenCalledWith(userId, subId);
    });
  });

  // deleteByUserNSub 메서드 테스트
  describe('deleteByUserNSub', () => {
    it('AchievementP를 성공적으로 삭제해야 한다', async () => {
      const userId = 1;
      const subId = 1;
      const mockAchievementP = {
        id: 1,
        user_id: userId,
        sub_achievement_id: subId,
      } as AchievementP;

      repository.findPByUserNSub.mockResolvedValue(mockAchievementP);
      repository.delete.mockResolvedValue(undefined);

      const result = await service.deleteByUserNSub(userId, subId);

      expect(repository.findPByUserNSub).toHaveBeenCalledWith(userId, subId);
      expect(repository.delete).toHaveBeenCalledWith(mockAchievementP.id);
      expect(result).toEqual({ message: '삭제 완료' });
    });

    it('AchievementP가 존재하지 않는 경우 BadRequestException을 발생시켜야 한다', async () => {
      const userId = 1;
      const subId = 1;

      repository.findPByUserNSub.mockResolvedValue(null);

      await expect(service.deleteByUserNSub(userId, subId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findPByUserNSub).toHaveBeenCalledWith(userId, subId);
    });
  });

  // deleteByPId 메서드 테스트
  describe('deleteByPId', () => {
    it('ID로 AchievementP를 성공적으로 삭제해야 한다', async () => {
      const achievementPId = '1';

      repository.delete.mockResolvedValue(undefined);

      const result = await service.deleteByPId(achievementPId);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: '삭제 완료' });
    });

    it('achievementPId가 유효하지 않은 경우 BadRequestException을 발생시켜야 한다', async () => {
      const achievementPId = 'invalid';

      await expect(service.deleteByPId(achievementPId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
