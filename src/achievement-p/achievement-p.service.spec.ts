import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPService } from './achievement-p.service';
import { AchievementPRepository } from './achievement-p.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AchievementPService', () => {
  let service: AchievementPService;
  let repository: AchievementPRepository;
  
  // 서비스에서 호출하는 리포지토리 메소드들을 모의(mock) 객체로 생성합니다.
  const mockRepository = {
    findPByUser: jest.fn(),
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

  // valkeyService의 메소드를 모의합니다.
  // 여기서는 Redis pipeline 기능과 단일 set 메소드를 모의합니다.
  const mockPipeline = {
    set: jest.fn(),
    exec: jest.fn().mockResolvedValue(true),
  };

  const mockValkeyService = {
    getClient: jest.fn().mockReturnValue({
      pipeline: () => mockPipeline,
    }),
    set: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    // NestJS의 테스트 모듈을 생성하여 서비스와 모의 리포지토리를 주입합니다.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementPService,
        { provide: AchievementPRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AchievementPService>(AchievementPService);
    repository = module.get<AchievementPRepository>(AchievementPRepository);
    // 서비스 내부의 valkeyService를 모의 객체로 할당합니다.
    service.valkeyService = mockValkeyService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // fillValkey 메소드에 대한 테스트
  describe('fillValkey', () => {
    it('user_id가 숫자가 아니면 BadRequestException을 던져야 함', async () => {
      await expect(service.fillValkey(NaN)).rejects.toThrow(BadRequestException);
    });

    it('유저의 서브업적 데이터가 없으면 NotFoundException을 던져야 함', async () => {
      mockRepository.findPByUser.mockResolvedValue([]);
      await expect(service.fillValkey(1)).rejects.toThrow(NotFoundException);
    });

    it('정상적으로 pipeline set과 exec가 호출되어야 함', async () => {
      const fakeData = [
        { id: 1, user_id: 1, sub_achievement_id: 101, achievement_id: 1001, complete: true },
        { id: 2, user_id: 1, sub_achievement_id: 102, achievement_id: 1002, complete: false },
      ];
      mockRepository.findPByUser.mockResolvedValue(fakeData);

      const result = await service.fillValkey(1);

      // 각 항목마다 pipeline.set이 호출되었는지 확인합니다.
      expect(mockPipeline.set).toHaveBeenCalledTimes(fakeData.length);
      // pipeline.exec이 한 번 호출되었는지 확인합니다.
      expect(mockPipeline.exec).toHaveBeenCalledTimes(1);
      // 반환 메시지가 올바른지 검증합니다.
      expect(result).toEqual({ message: `✅ ${fakeData.length}개의 서브업적이 Valkey에 저장되었습니다.` });
    });
  });

  // post 메소드에 대한 테스트
  describe('post', () => {
    it('subAchievementId가 숫자가 아니면 BadRequestException을 던져야 함', async () => {
      await expect(service.post(1, 'invalid')).rejects.toThrow(BadRequestException);
    });

    it('해당 서브업적이 존재하지 않으면 NotFoundException을 던져야 함', async () => {
      mockRepository.findSub.mockResolvedValue(null);
      await expect(service.post(1, '101')).rejects.toThrow(NotFoundException);
    });

    it('이미 등록된 서브업적이면 BadRequestException을 던져야 함', async () => {
      // findSub은 유효한 서브업적을 반환합니다.
      mockRepository.findSub.mockResolvedValue({ id: 101, achievement_id: 1001 });
      // 이미 등록된 경우를 가정하여 findPByUserNSub가 값을 반환합니다.
      mockRepository.findPByUserNSub.mockResolvedValue({ id: 1 });
      await expect(service.post(1, '101')).rejects.toThrow(BadRequestException);
    });

    it('정상 등록 케이스', async () => {
      // 정상적인 등록 프로세스를 모의합니다.
      mockRepository.findSub.mockResolvedValue({ id: 101, achievement_id: 1001 });
      mockRepository.findPByUserNSub.mockResolvedValue(null);
      const createdP = { id: 1, user_id: 1, sub_achievement_id: 101, achievement_id: 1001, complete: true };
      mockRepository.createP.mockReturnValue(createdP);
      mockRepository.save.mockResolvedValue(createdP);
      // 서브업적 목록과 등록된 P 목록을 모의하여 업적 완료 조건을 충족시킵니다.
      mockRepository.subAllByA.mockResolvedValue([{ id: 101 }, { id: 102 }]);
      mockRepository.pAllByA.mockResolvedValue([{ sub_achievement_id: 101 }, { sub_achievement_id: 102 }]);
      // 업적 완료(C 테이블) 관련 메소드 모의
      mockRepository.createC.mockResolvedValue({ id: 10 });
      mockRepository.saveC.mockResolvedValue({ id: 10 });
      // 보상 관련 모의
      mockRepository.reward.mockResolvedValue({ reward: { gem: 5, dia: 3 } });
      mockRepository.gem.mockResolvedValue(true);
      mockRepository.dia.mockResolvedValue(true);

      const result = await service.post(1, '101');
      expect(result).toEqual(createdP);
      // Redis에 데이터 저장을 위해 valkeyService.set이 호출되었는지 확인합니다.
      expect(mockValkeyService.set).toHaveBeenCalled();
    });
  });

  // deleteByUserNSub 메소드에 대한 테스트
  describe('deleteByUserNSub', () => {
    it('subAchievementId가 숫자가 아니면 BadRequestException을 던져야 함', async () => {
      await expect(service.deleteByUserNSub(1, 'invalid')).rejects.toThrow(BadRequestException);
    });

    it('해당 항목이 없으면 BadRequestException을 던져야 함', async () => {
      mockRepository.findPByUserNSub.mockResolvedValue(null);
      await expect(service.deleteByUserNSub(1, '101')).rejects.toThrow(BadRequestException);
    });

    it('정상적으로 삭제되어야 함', async () => {
      const fakeP = { id: 1 };
      mockRepository.findPByUserNSub.mockResolvedValue(fakeP);
      mockRepository.delete.mockResolvedValue(undefined);

      const result = await service.deleteByUserNSub(1, '101');
      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockRepository.delete).toHaveBeenCalledWith(fakeP.id);
    });
  });

  // deleteByPId 메소드에 대한 테스트
  describe('deleteByPId', () => {
    it('achievementPId가 숫자가 아니면 BadRequestException을 던져야 함', async () => {
      await expect(service.deleteByPId('invalid')).rejects.toThrow(BadRequestException);
    });

    it('정상적으로 삭제되어야 함', async () => {
      mockRepository.delete.mockResolvedValue(undefined);
      const result = await service.deleteByPId('1');
      expect(result).toEqual({ message: '삭제 완료' });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
