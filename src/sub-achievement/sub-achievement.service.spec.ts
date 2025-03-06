import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementService } from './sub-achievement.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSubAchievementDto } from './dto/create-sub-achievement.dto';
import { UpdateSubAchievementDto } from './dto/update-sub-achievement.dto';
import { SubAchievementMissionType } from './enums/sub-achievement-mission-type.enum';

describe('SubAchievementService', () => {
  let service: SubAchievementService;

  const mockSubAchievement = {
    id: 1,
    achievement_id: 1,
    title: 'Test SubAchievement',
  };

  const mockRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    fillGeo: jest.fn(),
  };

  const mockS3Service = {
    uploadFiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubAchievementService,
        { provide: 'SubAchievementRepository', useValue: mockRepository },
        { provide: 'S3Service', useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<SubAchievementService>(SubAchievementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new SubAchievement', async () => {
      const createDto: CreateSubAchievementDto = {
        title: 'Test SubAchievement',
        achievement_id: 1,
        content: '',
        latitude: 0,
        longitude: 0,
        mission_type: SubAchievementMissionType.VISIT_LOCATION,
      };
      const files = [{ originalname: 'image.png' }] as Express.Multer.File[];
      mockS3Service.uploadFiles.mockResolvedValue(['url1']);
      mockRepository.create.mockResolvedValue(mockSubAchievement);

      const result = await service.create(createDto, files);

      expect(result).toEqual(mockSubAchievement);
      expect(mockS3Service.uploadFiles).toHaveBeenCalledWith(files);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a SubAchievement', async () => {
      const id = '1';
      mockRepository.findOne.mockResolvedValue(mockSubAchievement);

      const result = await service.findOne(id);

      expect(result).toEqual(mockSubAchievement);
      expect(mockRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if SubAchievement is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a SubAchievement', async () => {
      const id = '1';
      const updateDto: UpdateSubAchievementDto = { title: 'Updated Title' };
      mockRepository.update.mockResolvedValue(mockSubAchievement);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(mockSubAchievement);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a SubAchievement', async () => {
      const id = '1';
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.softDelete(id);

      expect(result).toEqual({ message: '삭제 성공' });
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
    });
  });

  describe('fillGeo', () => {
    it('should fill Valkey with geo data', async () => {
      mockRepository.fillGeo.mockResolvedValue({ success: true });

      const result = await service.fillGeo();

      expect(result).toEqual({ success: true });
      expect(mockRepository.fillGeo).toHaveBeenCalled();
    });
  });
});
