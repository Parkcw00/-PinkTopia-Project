import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementService } from './sub-achievement.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';

describe('SubAchievementController', () => {
  let controller: SubAchievementController;
  let service: SubAchievementService;

  const mockSubAchievement = { id: 1, title: 'Test SubAchievement' };

  const mockService = {
    fillGeo: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubAchievementController],
      providers: [
        { provide: SubAchievementService, useValue: mockService },
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

    controller = module.get<SubAchievementController>(SubAchievementController);
    service = module.get<SubAchievementService>(SubAchievementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fillValkey', () => {
    it('should fill Valkey with geo data', async () => {
      mockService.fillGeo.mockResolvedValue({ success: true });

      const result = await controller.fillValkey();

      expect(result).toEqual({ success: true });
      expect(mockService.fillGeo).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a SubAchievement', async () => {
      const createDto: CreateSubAchievementDto = {
        title: 'Test SubAchievement',
      } as any;
      const files = [{ originalname: 'image.png' }] as Express.Multer.File[];
      mockService.create.mockResolvedValue(mockSubAchievement);

      const result = await controller.create(createDto, files);

      expect(result).toEqual(mockSubAchievement);
      expect(mockService.create).toHaveBeenCalledWith(createDto, files);
    });
  });

  describe('findOne', () => {
    it('should return a single SubAchievement', async () => {
      const subAchievementId = '1';
      mockService.findOne.mockResolvedValue(mockSubAchievement);

      const result = await controller.findOne(subAchievementId);

      expect(result).toEqual(mockSubAchievement);
      expect(mockService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a SubAchievement', async () => {
      const subAchievementId = '1';
      const updateDto: UpdateSubAchievementDto = { title: 'Updated Title' };
      mockService.update.mockResolvedValue(mockSubAchievement);

      const result = await controller.update(subAchievementId, updateDto);

      expect(result).toEqual(mockSubAchievement);
      expect(mockService.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a SubAchievement', async () => {
      const subAchievementId = '1';
      mockService.softDelete.mockResolvedValue({ message: '삭제 성공' });

      const result = await controller.remove(subAchievementId);

      expect(result).toEqual({ message: '삭제 성공' });
      expect(mockService.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
