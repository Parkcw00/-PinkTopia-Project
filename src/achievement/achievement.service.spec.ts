// import { Test, TestingModule } from '@nestjs/testing';
// import { AchievementService } from './achievement.service';
// import { AchievementRepository } from './achievement.repository';
// import { S3Service } from '../s3/s3.service';
// import {
//   BadRequestException,
//   NotFoundException,
//   ConflictException,
// } from '@nestjs/common';
// import { CreateAchievementDto } from './dto/create-achievement.dto';
// import { UpdateAchievementDto } from './dto/update-achievement.dto';
// import { AchievementCategory } from './enums/achievement-category.enum';

// describe('AchievementService', () => {
//   let service: AchievementService;
//   let repository: AchievementRepository;
//   let s3Service: S3Service;

//   const mockAchievement = {
//     id: 1,
//     title: 'Test Achievement',
//     category: AchievementCategory.CHALLENGE,
//     reward: '{ "gem": 100, "dia": 3 }',
//     achievement_images: ['url1'],
//     content: 'Test Content',
//     expiration_at: '2025-12-31 23:59:59',
//   };

//   const mockRepository = {
//     findByTitle: jest.fn(),
//     create: jest.fn(),
//     findAll: jest.fn(),
//     findAllDone: jest.fn(),
//     findAllActive: jest.fn(),
//     findCategory: jest.fn(),
//     findOne: jest.fn(),
//     findByAId: jest.fn(),
//     update: jest.fn(),
//     softDelete: jest.fn(),
//   };

//   const mockS3Service = {
//     uploadFiles: jest.fn(),
//     deleteFile: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AchievementService,
//         { provide: AchievementRepository, useValue: mockRepository },
//         { provide: S3Service, useValue: mockS3Service },
//       ],
//     }).compile();

//     service = module.get<AchievementService>(AchievementService);
//     repository = module.get<AchievementRepository>(AchievementRepository);
//     s3Service = module.get<S3Service>(S3Service);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('create', () => {
//     it('should create a new Achievement', async () => {
//       const createDto: CreateAchievementDto = {
//         title: 'Test Achievement',
//         category: AchievementCategory.CHALLENGE,
//         reward: { gem: 100, dia: 3 },
//         content: 'Test Content',
//         expiration_at: new Date('2025-12-31'),
//       };
//       const files = [{ originalname: 'image.png' }] as Express.Multer.File[];
//       mockRepository.findByTitle.mockResolvedValue(null);
//       mockS3Service.uploadFiles.mockResolvedValue(['url1']);
//       mockRepository.create.mockResolvedValue(mockAchievement);

//       const result = await service.create(createDto, files);

//       expect(result).toEqual(
//         expect.objectContaining({ title: 'Test Achievement' }),
//       );
//       expect(mockS3Service.uploadFiles).toHaveBeenCalledWith(files);
//       expect(mockRepository.create).toHaveBeenCalled();
//     });

//     it('should throw BadRequestException if dto is invalid', async () => {
//       await expect(service.create(null, [])).rejects.toThrow(
//         BadRequestException,
//       );
//     });

//     it('should throw NotFoundException if title already exists', async () => {
//       const createDto: CreateAchievementDto = {
//         title: 'Test Achievement',
//       } as any;
//       mockRepository.findByTitle.mockResolvedValue(mockAchievement);

//       await expect(service.create(createDto, [])).rejects.toThrow(
//         NotFoundException,
//       );
//     });
//   });

//   describe('findAll', () => {
//     it('should return all achievements', async () => {
//       mockRepository.findAll.mockResolvedValue([mockAchievement]);

//       const result = await service.findAll();

//       expect(result).toEqual([
//         expect.objectContaining({ title: 'Test Achievement' }),
//       ]);
//       expect(mockRepository.findAll).toHaveBeenCalled();
//     });

//     it('should throw NotFoundException if no achievements exist', async () => {
//       mockRepository.findAll.mockResolvedValue(null);

//       await expect(service.findAll()).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('findOne', () => {
//     it('should return an achievement with sub-achievements', async () => {
//       const id = '1';
//       mockRepository.findOne.mockResolvedValue(mockAchievement);
//       mockRepository.findByAId.mockResolvedValue([{ id: 1 }]);

//       const result = await service.findOne(id);

//       expect(result).toEqual({
//         title: 'Test Achievement',
//         subAchievements: [{ id: 1 }],
//       });
//     });

//     it('should throw BadRequestException if id is invalid', async () => {
//       await expect(service.findOne('invalid')).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });

//   describe('update', () => {
//     it('should update an existing achievement', async () => {
//       const id = '1';
//       const updateDto: UpdateAchievementDto = { title: 'Updated Title' };
//       mockRepository.findOne.mockResolvedValue(mockAchievement);
//       mockRepository.findByTitle.mockResolvedValue(null);
//       mockRepository.update.mockResolvedValue(undefined);
//       mockRepository.findOne.mockResolvedValue({
//         ...mockAchievement,
//         title: 'Updated Title',
//       });

//       const result = await service.update(id, updateDto, []);

//       expect(result[0]).toEqual({ message: '수정 성공' });
//       expect(result[1].title).toBe('Updated Title');
//     });

//     it('should throw ConflictException if new title already exists', async () => {
//       const id = '1';
//       const updateDto: UpdateAchievementDto = { title: 'Existing Title' };
//       mockRepository.findOne.mockResolvedValue(mockAchievement);
//       mockRepository.findByTitle.mockResolvedValue({
//         id: 2,
//         title: 'Existing Title',
//       });

//       await expect(service.update(id, updateDto, [])).rejects.toThrow(
//         ConflictException,
//       );
//     });
//   });

//   describe('remove', () => {
//     it('should soft delete an achievement', async () => {
//       const id = '1';
//       mockRepository.softDelete.mockResolvedValue(undefined);
//       mockRepository.findOne.mockResolvedValue(null);

//       const result = await service.remove(id);

//       expect(result).toEqual({ message: '삭제 성공' });
//     });

//     it('should throw NotFoundException if deletion fails', async () => {
//       const id = '1';
//       mockRepository.softDelete.mockResolvedValue(undefined);
//       mockRepository.findOne.mockResolvedValue(mockAchievement);

//       await expect(service.remove(id)).rejects.toThrow(NotFoundException);
//     });
//   });
// });
