import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementService } from './sub-achievement.service';
import { SubAchievementRepository } from './sub-achievement.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { GeoService } from '../geo/geo.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';
import { SubAchievement } from './entities/sub-achievement.entity';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';

describe('SubAchievementService', () => {
  let service: SubAchievementService;
  let repository: jest.Mocked<SubAchievementRepository>;
  let s3Service: jest.Mocked<S3Service>;
  let valkeyService: jest.Mocked<ValkeyService>;
  let geoService: jest.Mocked<GeoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubAchievementService,
        {
          provide: SubAchievementRepository,
          useValue: {
            findByTitle: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete_achievement_c: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFiles: jest.fn(),
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: GeoService,
          useValue: {
            geoAddBookmarkS: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubAchievementService>(SubAchievementService);
    repository = module.get(
      SubAchievementRepository,
    ) as jest.Mocked<SubAchievementRepository>;
    s3Service = module.get(S3Service) as jest.Mocked<S3Service>;
    valkeyService = module.get(ValkeyService) as jest.Mocked<ValkeyService>;
    geoService = module.get(GeoService) as jest.Mocked<GeoService>;
  });

  describe('create', () => {
    it('should create a sub-achievement successfully', async () => {
      const createSubAchievementDto: CreateSubAchievementDto = {
        achievement_id: 1,
        title: 'Test Sub-Achievement',
        mission_type: SubAchievementMissionType.COMPLETE_TASK,
        content: 'Test Content',
        longitude: 127.0,
        latitude: 37.0,
        expiration_at: new Date('2025-12-31'),
      };
      const files: Express.Multer.File[] = [];
      const mockSubAchievement = {
        id: 1,
        ...createSubAchievementDto,
        sub_achievement_images: ['mock-image-url'],
        created_at: new Date(),
        updated_at: new Date(),
      } as SubAchievement;

      valkeyService.get.mockResolvedValue(null);
      s3Service.uploadFiles.mockResolvedValue(['mock-image-url']);
      repository.create.mockResolvedValue(mockSubAchievement); // repository.create.mockReturnValue(mockSubAchievement);
      repository.save.mockResolvedValue(mockSubAchievement);
      repository.delete_achievement_c.mockResolvedValue({ affected: 1 } as any); // repository.delete_achievement_c.mockResolvedValue(undefined);
      geoService.geoAddBookmarkS.mockResolvedValue(undefined);

      const result = await service.create(createSubAchievementDto, files);

      expect(valkeyService.get).toHaveBeenCalledWith(
        `title:${createSubAchievementDto.title}`,
      );
      expect(s3Service.uploadFiles).toHaveBeenCalledWith(files);
      expect(repository.create).toHaveBeenCalledWith({
        achievement_id: createSubAchievementDto.achievement_id,
        title: createSubAchievementDto.title,
        mission_type: createSubAchievementDto.mission_type,
        content: createSubAchievementDto.content,
        longitude: createSubAchievementDto.longitude,
        latitude: createSubAchievementDto.latitude,
        sub_achievement_images: ['mock-image-url'],
        expiration_at: createSubAchievementDto.expiration_at,
      });
      expect(repository.save).toHaveBeenCalledWith(mockSubAchievement);
      expect(repository.delete_achievement_c).toHaveBeenCalledWith(
        createSubAchievementDto.achievement_id,
      );
      expect(geoService.geoAddBookmarkS).toHaveBeenCalledWith(
        'sub-achievement',
        expect.any(Object),
      );
      expect(result).toEqual({ subAchievement: mockSubAchievement });
    });

    it('should throw NotFoundException if title already exists', async () => {
      const createSubAchievementDto: CreateSubAchievementDto = {
        achievement_id: 1,
        title: 'Existing Title',
        mission_type: SubAchievementMissionType.COMPLETE_TASK,
        content: 'Test Content',
        longitude: 127.0,
        latitude: 37.0,
        expiration_at: new Date('2025-12-31'),
      };
      const files: Express.Multer.File[] = [];

      valkeyService.get.mockResolvedValue('existing-data');

      await expect(
        service.create(createSubAchievementDto, files),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if DTO is invalid', async () => {
      const createSubAchievementDto = {} as CreateSubAchievementDto;
      const files: Express.Multer.File[] = [];

      await expect(
        service.create(createSubAchievementDto, files),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
