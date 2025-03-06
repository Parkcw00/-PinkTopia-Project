import { Test, TestingModule } from '@nestjs/testing';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

describe('AchievementController', () => {
  let controller: AchievementController;
  let service: AchievementService;

  const mockAchievement = { id: 1, title: 'Test Achievement' };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllDone: jest.fn(),
    findAllActive: jest.fn(),
    findCategory: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementController],
      providers: [
        { provide: AchievementService, useValue: mockService },
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

    controller = module.get<AchievementController>(AchievementController);
    service = module.get<AchievementService>(AchievementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an Achievement', async () => {
      const createDto: CreateAchievementDto = {
        title: 'Test Achievement',
      } as any;
      const files = [{ originalname: 'image.png' }] as Express.Multer.File[];
      mockService.create.mockResolvedValue(mockAchievement);

      const result = await controller.create(createDto, files);

      expect(result).toEqual(mockAchievement);
      expect(mockService.create).toHaveBeenCalledWith(createDto, files);
    });
  });

  describe('findAll', () => {
    it('should return all Achievements', async () => {
      mockService.findAll.mockResolvedValue([mockAchievement]);

      const result = await controller.findAll();

      expect(result).toEqual([mockAchievement]);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single Achievement', async () => {
      const achievementId = '1';
      mockService.findOne.mockResolvedValue(mockAchievement);

      const result = await controller.findOne(achievementId);

      expect(result).toEqual(mockAchievement);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update an Achievement', async () => {
      const achievementId = '1';
      const updateDto: UpdateAchievementDto = { title: 'Updated Title' };
      const files = [] as Express.Multer.File[];
      mockService.update.mockResolvedValue([
        { message: '수정 성공' },
        mockAchievement,
      ]);

      const result = await controller.update(achievementId, updateDto, files);

      expect(result).toEqual([{ message: '수정 성공' }, mockAchievement]);
      expect(mockService.update).toHaveBeenCalledWith('1', updateDto, files);
    });
  });

  describe('remove', () => {
    it('should remove an Achievement', async () => {
      const achievementId = '1';
      mockService.remove.mockResolvedValue({ message: '삭제 성공' });

      const result = await controller.remove(achievementId);

      expect(result).toEqual({ message: '삭제 성공' });
      expect(mockService.remove).toHaveBeenCalledWith('1');
    });
  });
});
