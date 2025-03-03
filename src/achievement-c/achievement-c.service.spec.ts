import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCService } from './achievement-c.service';
import { AchievementCRepository } from './achievement-c.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';

describe('AchievementCService', () => {
  let service: AchievementCService;
  let repository: AchievementCRepository;

  // AchievementCRepository의 각 메서드를 모킹(mock)하여 테스트 시 실제 DB 접근을 피함
  const mockRepository = {
    isExists: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findTitleC: jest.fn(),
    findP: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    // 테스트 모듈을 생성하고 AchievementCService와 모킹한 Repository를 주입
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementCService,
        {
          provide: AchievementCRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AchievementCService>(AchievementCService);
    repository = module.get<AchievementCRepository>(AchievementCRepository);
  });

  afterEach(() => {
    // 각 테스트 후 모킹한 함수들을 초기화하여 테스트 간 간섭 방지
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('DTO 데이터가 없으면 BadRequestException을 던져야 한다', async () => {
      // 데이터가 없을 때 예외가 발생하는지 확인
      await expect(service.create(null as unknown as CreateAchievementCDto)).rejects.toThrow(BadRequestException);

//      await expect(service.create(null)).rejects.toThrow(BadRequestException);
    });

    it('이미 존재하는 항목이면 BadRequestException을 던져야 한다', async () => {
      const createDto: CreateAchievementCDto = { user_id: 1, achievement_id: 1 };
      // repository.isExists가 true를 반환하도록 모킹
      mockRepository.isExists.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(mockRepository.isExists).toHaveBeenCalledWith(createDto.user_id, createDto.achievement_id);
    });

    it('정상적인 입력이면 새 항목을 생성 및 저장 후 반환해야 한다', async () => {
      const createDto: CreateAchievementCDto = { user_id: 1, achievement_id: 1 };
      // 존재하지 않는 항목이라고 가정
      mockRepository.isExists.mockResolvedValue(false);
      // repository.create가 생성된 객체를 반환하도록 모킹
      const createdEntity = { id: 1, ...createDto };
      mockRepository.create.mockResolvedValue(createdEntity);
      // repository.save가 저장된 객체를 반환하도록 모킹
      mockRepository.save.mockResolvedValue(createdEntity);

      const result = await service.create(createDto);
      expect(result).toEqual(createdEntity);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdEntity);
    });
  });

  describe('findOne', () => {
    it('id가 없으면 NotFoundException을 던져야 한다', async () => {
      await expect(service.findOne(null as unknown as string)).rejects.toThrow(NotFoundException);

//      await expect(service.findOne(null)).rejects.toThrow(NotFoundException);
    });

    it('유효하지 않은 id(숫자형 변환 불가)인 경우 BadRequestException을 던져야 한다', async () => {
      await expect(service.findOne('abc')).rejects.toThrow(BadRequestException);
    });

    it('title을 찾을 수 없으면 NotFoundException을 던져야 한다', async () => {
      // id가 '1'인 경우 title을 찾지 못하는 상황 테스트
      const id = '1';
      mockRepository.findTitleC.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findTitleC).toHaveBeenCalledWith(1);
    });

    it('관련 서브업적이 없으면 NotFoundException을 던져야 한다', async () => {
      const id = '1';
      // title은 존재하지만 관련 서브업적이 없을 경우
      mockRepository.findTitleC.mockResolvedValue('Test Title');
      mockRepository.findP.mockResolvedValue([]);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findP).toHaveBeenCalledWith(1);
    });

    it('정상적인 입력이면 동적 키로 구성된 결과 객체를 반환해야 한다', async () => {
      const id = '1';
      const testTitle = 'Test Achievement';
      const testSubAchievements = [{ id: 1, name: 'SubAchievement1' }];

      mockRepository.findTitleC.mockResolvedValue(testTitle);
      mockRepository.findP.mockResolvedValue(testSubAchievements);

      const result = await service.findOne(id);
      // 반환 객체의 key가 title(동적)이어야 함
      expect(result).toEqual({ [testTitle]: testSubAchievements });
    });
  });

  describe('findAll', () => {
    it('모든 업적 데이터를 반환해야 한다', async () => {
      const achievements = [{ id: 1 }, { id: 2 }];
      mockRepository.findAll.mockResolvedValue(achievements);

      const result = await service.findAll();
      expect(result).toEqual(achievements);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('유효하지 않은 id인 경우 BadRequestException을 던져야 한다', async () => {
      await expect(service.remove('abc')).rejects.toThrow(BadRequestException);
    });

    it('삭제가 실패하면 NotFoundException을 던져야 한다', async () => {
      const id = '1';
      // affected 값이 0인 경우 삭제 실패 상황
      mockRepository.remove.mockResolvedValue({ affected: 0 });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.remove).toHaveBeenCalledWith(1);
    });

    it('삭제 성공 시 성공 메시지를 반환해야 한다', async () => {
      const id = '1';
      // affected 값이 1 이상이면 삭제 성공
      mockRepository.remove.mockResolvedValue({ affected: 1 });

      const result = await service.remove(id);
      expect(result).toEqual({ message: '삭제 성공' });
    });
  });
});
