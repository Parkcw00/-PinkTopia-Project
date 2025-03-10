import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCService } from './achievement-c.service';
import { AchievementCRepository } from './achievement-c.repository';
import { BadRequestException } from '@nestjs/common';
import { AchievementC } from './entities/achievement-c.entity';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';

describe('AchievementCService', () => {
  let service: AchievementCService;
  let repository: jest.Mocked<AchievementCRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementCService,
        {
          provide: AchievementCRepository,
          useValue: {
            isExists: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findTitleC: jest.fn(),
            findP: jest.fn(),
            findAll: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AchievementCService>(AchievementCService);
    repository = module.get<AchievementCRepository>(
      AchievementCRepository,
    ) as jest.Mocked<AchievementCRepository>;
  });

  describe('create', () => {
    it('should create an achievementC successfully', async () => {
      const createAchievementCDto: CreateAchievementCDto = {
        user_id: 1,
        achievement_id: 1,
      };

      const mockAchievementC = {
        id: 1,
        user_id: 1,
        achievement_id: 1,
        created_at: new Date(),
      } as AchievementC;

      repository.isExists.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockAchievementC);
      repository.save.mockResolvedValue(mockAchievementC);

      const result = await service.create(createAchievementCDto);

      expect(repository.isExists).toHaveBeenCalledWith(
        createAchievementCDto.user_id,
        createAchievementCDto.achievement_id,
      );
      expect(repository.create).toHaveBeenCalledWith(createAchievementCDto);
      expect(repository.save).toHaveBeenCalledWith(mockAchievementC);
      expect(result).toEqual(mockAchievementC);
    });

    it('should throw BadRequestException if achievementC already exists', async () => {
      const createAchievementCDto: CreateAchievementCDto = {
        user_id: 1,
        achievement_id: 1,
      };

      repository.isExists.mockResolvedValue({ id: 1 } as AchievementC);

      await expect(service.create(createAchievementCDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if DTO is invalid', async () => {
      const createAchievementCDto = {} as CreateAchievementCDto;

      await expect(service.create(createAchievementCDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
