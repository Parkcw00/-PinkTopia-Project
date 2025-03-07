import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementService } from './sub-achievement.service';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';
import { SubAchievement } from './entities/sub-achievement.entity';
import { UserService } from '../user/user.service'; // 실제 경로로 수정
import { UserRepository } from '../user/user.repository'; // 실제 경로로 수정
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from '../valkey/valkey.service'; // 실제 경로로 수정

describe('SubAchievementController', () => {
  let controller: SubAchievementController;
  let service: jest.Mocked<SubAchievementService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubAchievementController],
      providers: [
        {
          provide: SubAchievementService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // 필요한 메서드 모킹
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // 필요한 메서드 모킹
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'), // 필요한 메서드 모킹
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-config-value'), // 필요한 메서드 모킹
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn().mockResolvedValue('mock-valkey-value'), // 필요한 메서드 모킹
          },
        },
      ],
    }).compile();

    controller = module.get<SubAchievementController>(SubAchievementController);
    service = module.get<SubAchievementService>(
      SubAchievementService,
    ) as jest.Mocked<SubAchievementService>;
  });

  it('should create a sub-achievement', async () => {
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
      sub_achievement_images: [],
    } as unknown as SubAchievement;

    service.create.mockResolvedValue({ subAchievement: mockSubAchievement });

    const result = await controller.create(createSubAchievementDto, files);

    expect(service.create).toHaveBeenCalledWith(createSubAchievementDto, files);
    expect(result).toEqual({ subAchievement: mockSubAchievement });
  });
});
