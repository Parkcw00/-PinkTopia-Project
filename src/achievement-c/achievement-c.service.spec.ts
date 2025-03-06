import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCService } from './achievement-c.service';
import { AchievementCRepository } from './achievement-c.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';

describe('AchievementCService', () => {
  let service: AchievementCService;
  let repository: AchievementCRepository;

  const mockAchievementC = {
    id: 1,
    user_id: 1,
    achievement_id: 1,
  };

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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementCService,
        { provide: AchievementCRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AchievementCService>(AchievementCService);
    repository = module.get<AchievementCRepository>(AchievementCRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new AchievementC', async () => {
      const createDto: CreateAchievementCDto = {
        user_id: 1,
        achievement_id: 1,
      };
      mockRepository.isExists.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockAchievementC);
      mockRepository.save.mockResolvedValue(mockAchievementC);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAchievementC);
      expect(mockRepository.isExists).toHaveBeenCalledWith(1, 1);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockAchievementC);
    });

    it('should throw BadRequestException if dto is invalid', async () => {
      await expect(service.create({} as CreateAchievementCDto)).rejects.toThrow(
        BadRequestException,
      );
      //      await expect(service.create(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if AchievementC already exists', async () => {
      const createDto: CreateAchievementCDto = {
        user_id: 1,
        achievement_id: 1,
      };
      mockRepository.isExists.mockResolvedValue(mockAchievementC);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single AchievementC with title and sub-achievements', async () => {
      const id = '1';
      const title = 'Test Title';
      const subAchievements = [{ id: 1 }];
      mockRepository.findTitleC.mockResolvedValue(title);
      mockRepository.findP.mockResolvedValue(subAchievements);

      const result = await service.findOne(id);

      expect(result).toEqual({ [title]: subAchievements });
      expect(mockRepository.findTitleC).toHaveBeenCalledWith(1);
      expect(mockRepository.findP).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if id is invalid', async () => {
      await expect(service.findOne(undefined as any)).rejects.toThrow(
        NotFoundException,
      );
      //      await expect(service.findOne(null)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if AchievementC is not found', async () => {
      mockRepository.findTitleC.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all AchievementC records', async () => {
      const achievements = [mockAchievementC];
      mockRepository.findAll.mockResolvedValue(achievements);

      const result = await service.findAll();

      expect(result).toEqual(achievements);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an AchievementC and return success message', async () => {
      const id = '1';
      mockRepository.remove.mockResolvedValue({ affected: 1 });

      const result = await service.remove(id);

      expect(result).toEqual({ message: '삭제 성공' });
      expect(mockRepository.remove).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      await expect(service.remove('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if AchievementC is not found', async () => {
      mockRepository.remove.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
