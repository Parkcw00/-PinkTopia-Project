import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCController } from './achievement-c.controller';
import { AchievementCService } from './achievement-c.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';

describe('AchievementCController', () => {
  let controller: AchievementCController;
  let service: AchievementCService;

  const mockAchievementC = { id: 1, user_id: 1, achievement_id: 1 };

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementCController],
      providers: [
        { provide: AchievementCService, useValue: mockService },
        {
          provide: UserGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<AchievementCController>(AchievementCController);
    service = module.get<AchievementCService>(AchievementCService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an AchievementC', async () => {
      const req = { user: { id: 1 } };
      const createDto: CreateAchievementCDto = {
        user_id: 1,
        achievement_id: 1,
      };
      mockService.create.mockResolvedValue(mockAchievementC);

      const result = await controller.create(req, createDto);

      expect(result).toEqual(mockAchievementC);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return a single AchievementC', async () => {
      const achievementCId = '1';
      mockService.findOne.mockResolvedValue(mockAchievementC);

      const result = await controller.findOne(achievementCId);

      expect(result).toEqual(mockAchievementC);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('find', () => {
    it('should return all AchievementC records', async () => {
      mockService.findAll.mockResolvedValue([mockAchievementC]);

      const result = await controller.find();

      expect(result).toEqual([mockAchievementC]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an AchievementC', async () => {
      const achievementCId = '1';
      mockService.remove.mockResolvedValue({ message: '삭제 성공' });

      const result = await controller.remove(achievementCId);

      expect(result).toEqual({ message: '삭제 성공' });
      expect(mockService.remove).toHaveBeenCalledWith('1');
    });
  });
});
