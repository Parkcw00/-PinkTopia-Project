import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from './achievement.service';
import { AchievementRepository } from './achievement.repository';
import { S3Service } from '../s3/s3.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AchievementCategory } from './enums/achievement-category.enum';
import { Achievement } from './entities/achievement.entity';
import { CreateAchievementDto } from './dto/create-achievement.dto';

describe('AchievementService', () => {
  let service: AchievementService;
  let repository: jest.Mocked<AchievementRepository>;
  let s3Service: jest.Mocked<S3Service>;
  const mockAchievement = {
    id: 1,
    title: 'Test Achievement',
    content: 'Test Content',
    category: 'JEJU_TOUR',
    expiration_at: '2025-12-31T00:00:00.000Z',
    achievement_images: ['mock-image-url'],
    reward: { gem: 100, dia: 5 },
    achievement_c: undefined,
    sub_achievement: undefined,
    created_at: expect.any(String),
    updated_at: expect.any(String),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        {
          provide: AchievementRepository,
          useValue: {
            findByTitle: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFiles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AchievementService>(AchievementService);
    repository = module.get<AchievementRepository>(
      AchievementRepository,
    ) as jest.Mocked<AchievementRepository>;
    s3Service = module.get<S3Service>(S3Service) as jest.Mocked<S3Service>;
  });
  describe('create', () => {
    it('should create an achievement successfully', async () => {
      const createAchievementDto: CreateAchievementDto = {
        title: 'Test Achievement',
        category: AchievementCategory.JEJU_TOUR,
        reward: { gem: 100, dia: 5 },
        content: 'Test Content',
        expiration_at: new Date('2025-12-31'),
      };
      const files: Express.Multer.File[] = [];
      const mockAchievement = {
        id: 1,
        ...createAchievementDto,
        achievement_images: ['mock-image-url'],
        achievement_c: undefined, // 추가
        created_at: undefined, // 추가 (또는 expect.any(String) 사용 가능)
        deleted_at: null, // 추가
        sub_achievement: undefined, // 추가
        updated_at: undefined, // 추가 (또는 expect.any(String) 사용 가능)
        expiration_at: '2025-12-31 00:00:00', // 서비스에서 사용하는 형식에 맞게 수정
      } as unknown as Achievement;

      repository.findByTitle.mockResolvedValue(null);
      s3Service.uploadFiles.mockResolvedValue(['mock-image-url']);
      repository.create.mockResolvedValue(mockAchievement);

      const result = await service.create(createAchievementDto, files);

      expect(repository.findByTitle).toHaveBeenCalledWith(
        createAchievementDto.title,
      );
      expect(s3Service.uploadFiles).toHaveBeenCalledWith(files);
      expect(repository.create).toHaveBeenCalledWith({
        title: createAchievementDto.title,
        category: createAchievementDto.category,
        reward: createAchievementDto.reward,
        content: createAchievementDto.content,
        achievement_images: ['mock-image-url'],
        expiration_at: expect.any(String),
      });
      expect(result).toEqual(mockAchievement);
    });
  });
  /*
  describe('create', () => {
    it('should create an achievement successfully', async () => {
      const createAchievementDto: CreateAchievementDto = {
        title: 'Test Achievement',
        category: AchievementCategory.JEJU_TOUR,
        reward: { gem: 100, dia: 5 }, //'Test Reward',
        content: 'Test Content',
        expiration_at: new Date('2025-12-31'),
      };
      const files: Express.Multer.File[] = [];
      const mockAchievement = {
        id: 1,
        ...createAchievementDto,
        achievement_images: ['mock-image-url'],
      } as unknown as Achievement;

      repository.findByTitle.mockResolvedValue(null);
      s3Service.uploadFiles.mockResolvedValue(['mock-image-url']);
      repository.create.mockResolvedValue(mockAchievement);

      const result = await service.create(createAchievementDto, files);

      expect(repository.findByTitle).toHaveBeenCalledWith(
        createAchievementDto.title,
      );
      expect(s3Service.uploadFiles).toHaveBeenCalledWith(files);
      expect(repository.create).toHaveBeenCalledWith({
        title: createAchievementDto.title,
        category: createAchievementDto.category,
        reward: createAchievementDto.reward,
        content: createAchievementDto.content,
        achievement_images: ['mock-image-url'],
        expiration_at: expect.any(String),
      });
      expect(result).toEqual(mockAchievement);
    });

    it('should throw NotFoundException if title already exists', async () => {
      const createAchievementDto: CreateAchievementDto = {
        title: 'Existing Title',
        category: AchievementCategory.JEJU_TOUR,
        reward: { gem: 100, dia: 5 }, //'Test Reward',
        content: 'Test Content',
        expiration_at: new Date('2025-12-31'),
      };
      const files: Express.Multer.File[] = [];

      repository.findByTitle.mockResolvedValue({ id: 1 } as Achievement);

      await expect(service.create(createAchievementDto, files)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if DTO is invalid', async () => {
      const createAchievementDto = {} as CreateAchievementDto;
      const files: Express.Multer.File[] = [];

      await expect(service.create(createAchievementDto, files)).rejects.toThrow(
        BadRequestException,
      );
    });
  });*/
});
