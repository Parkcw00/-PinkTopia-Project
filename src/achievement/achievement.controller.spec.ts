import { Test, TestingModule } from '@nestjs/testing';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { AchievementCategory } from './enums/achievement-category.enum';
import { Achievement } from './entities/achievement.entity';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from '../valkey/valkey.service'; // Adjust the import path as needed

describe('AchievementController', () => {
  let controller: AchievementController;
  let service: jest.Mocked<AchievementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementController],
      providers: [
        {
          provide: AchievementService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // Mock required methods
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // Mock required methods
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'), // Mock JwtService
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-config-value'), // Mock ConfigService
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn().mockResolvedValue('mock-valkey-value'), // Mock ValkeyService
          },
        },
      ],
    }).compile();

    controller = module.get<AchievementController>(AchievementController);
    service = module.get<AchievementService>(
      AchievementService,
    ) as jest.Mocked<AchievementService>;
  });

  it('should create an achievement', async () => {
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
      achievement_images: [],
    } as unknown as Achievement;

    service.create.mockResolvedValue(mockAchievement);

    const result = await controller.create(createAchievementDto, files);

    expect(service.create).toHaveBeenCalledWith(createAchievementDto, files);
    expect(result).toEqual(mockAchievement);
  });
});
