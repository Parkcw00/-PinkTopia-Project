import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPService } from './achievement-p.service';
import { AchievementPRepository } from './achievement-p.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AchievementP } from './entities/achievement-p.entity';
import { number } from 'joi';

describe('AchievementPService', () => {
  let service: AchievementPService;
  let repository: AchievementPRepository;

  const mockAchievementP = {
    id: 1,
    user_id: 1,
    sub_achievement_id: 1,
    achievement_id: 1,
    complete: true,
  };

  const mockSubAchievement = {
    id: 1,
    achievement_id: 1,
  };

  const mockReward = {
    reward: { gem: 100, dia: 3 },
  };

  const mockRepository = {
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
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementPService,
        { provide: AchievementPRepository, useValue: mockRepository },
        { provide: ValkeyService, useValue: mockValkeyService },
      ],
    }).compile();

    service = module.get<AchievementPService>(AchievementPService);
    repository = module.get<AchievementPRepository>(AchievementPRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('post', () => {
    it('should create a new AchievementP and return it', async () => {
      const user_id = 1;
      const subId = 1;

      mockRepository.findSub.mockResolvedValue(mockSubAchievement);
      mockRepository.findPByUserNSub.mockResolvedValue(null);
      mockRepository.createP.mockReturnValue(mockAchievementP);
      mockRepository.save.mockResolvedValue(mockAchievementP);
      mockRepository.subAllByA.mockResolvedValue([{ id: 1 }]);
      mockRepository.pAllByA.mockResolvedValue([{ sub_achievement_id: 1 }]);
      mockRepository.createC.mockResolvedValue({
        id: 1,
        user_id,
        achievement_id: 1,
      });
      mockRepository.saveC.mockResolvedValue({
        id: 1,
        user_id,
        achievement_id: 1,
      });
      mockRepository.reward.mockResolvedValue(mockReward);
      mockRepository.gem.mockResolvedValue(undefined);
      mockRepository.dia.mockResolvedValue(undefined);

      const result = await service.post(user_id, subId);

      expect(result).toEqual(mockAchievementP);
      expect(mockRepository.findSub).toHaveBeenCalledWith(subId);
      expect(mockRepository.findPByUserNSub).toHaveBeenCalledWith(
        user_id,
        subId,
      );
      expect(mockRepository.createP).toHaveBeenCalledWith({
        user_id,
        sub_achievement_id: subId,
        achievement_id: mockSubAchievement.achievement_id,
        complete: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAchievementP);
      expect(mockRepository.reward).toHaveBeenCalledWith(
        mockSubAchievement.achievement_id,
      );
      expect(mockRepository.gem).toHaveBeenCalledWith(user_id, 100);
      expect(mockRepository.dia).toHaveBeenCalledWith(user_id, 3);
    });

    it('should throw BadRequestException if subId is invalid', async () => {
      const user_id = 1;
      const subId = 2;

      await expect(service.post(user_id, subId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if subAchievement does not exist', async () => {
      const user_id = 1;
      const subId = 1;

      mockRepository.findSub.mockResolvedValue(null);

      await expect(service.post(user_id, subId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if AchievementP already exists', async () => {
      const user_id = 1;
      const subId = 1;

      mockRepository.findSub.mockResolvedValue(mockSubAchievement);
      mockRepository.findPByUserNSub.mockResolvedValue(mockAchievementP);

      await expect(service.post(user_id, subId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteByUserNSub', () => {
    it('should delete an AchievementP and return success message', async () => {
      const user_id = 1;
      const subId = 1;

      mockRepository.findPByUserNSub.mockResolvedValue(mockAchievementP);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteByUserNSub(user_id, subId);

      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockRepository.findPByUserNSub).toHaveBeenCalledWith(
        user_id,
        subId,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(mockAchievementP.id);
    });

    it('should throw BadRequestException if subId is invalid', async () => {
      const user_id = 1;
      const subId = 2;

      await expect(service.deleteByUserNSub(user_id, subId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if AchievementP does not exist', async () => {
      const user_id = 1;
      const subId = 1;

      mockRepository.findPByUserNSub.mockResolvedValue(null);

      await expect(service.deleteByUserNSub(user_id, subId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteByPId', () => {
    it('should delete an AchievementP by ID and return success message', async () => {
      const achievementPId = '1';

      mockRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteByPId(achievementPId);

      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if achievementPId is invalid', async () => {
      const achievementPId = 'invalid';

      await expect(service.deleteByPId(achievementPId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
