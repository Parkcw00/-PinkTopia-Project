// import { Test, TestingModule } from '@nestjs/testing';
// import { SubAchievementRepository } from './sub-achievement.repository';
// import { Repository } from 'typeorm';
// import { SubAchievement } from './entities/sub-achievement.entity';
// import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';

// describe('SubAchievementRepository', () => {
//   let subAchievementRepository: SubAchievementRepository;

//   const mockSubAchievement = {
//     id: 1,
//     achievement_id: 1,
//     title: 'Test Achievement',
//     content: 'Test Content',
//   };

//   const mockEntity = {
//     find: jest.fn(),
//     findOne: jest.fn(),
//     create: jest.fn(),
//     save: jest.fn(),
//     update: jest.fn(),
//     softDelete: jest.fn(),
//   };

//   const mockEntityC = {
//     delete: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         SubAchievementRepository,
//         { provide: getRepositoryToken(SubAchievement), useValue: mockEntity },
//         { provide: getRepositoryToken(AchievementC), useValue: mockEntityC },
//       ],
//     }).compile();

//     subAchievementRepository = module.get<SubAchievementRepository>(
//       SubAchievementRepository,
//     );
//   });

//   it('should be defined', () => {
//     expect(subAchievementRepository).toBeDefined();
//   });

//   describe('getAll', () => {
//     it('should return all sub-achievements', async () => {
//       mockEntity.find.mockResolvedValue([mockSubAchievement]);

//       const result = await subAchievementRepository.getAll();
//       expect(result).toEqual([mockSubAchievement]);
//       expect(mockEntity.find).toHaveBeenCalled();
//     });
//   });

//   describe('findByTitle', () => {
//     it('should find sub-achievement by title', async () => {
//       mockEntity.findOne.mockResolvedValue(mockSubAchievement);

//       const result =
//         await subAchievementRepository.findByTitle('Test Achievement');
//       expect(result).toEqual(mockSubAchievement);
//       expect(mockEntity.findOne).toHaveBeenCalledWith({
//         where: { title: 'Test Achievement' },
//       });
//     });
//   });

//   describe('create', () => {
//     it('should create a sub-achievement entity', async () => {
//       mockEntity.create.mockReturnValue(mockSubAchievement);

//       const result = await subAchievementRepository.create(mockSubAchievement);
//       expect(result).toEqual(mockSubAchievement);
//       expect(mockEntity.create).toHaveBeenCalledWith(mockSubAchievement);
//     });
//   });

//   describe('save', () => {
//     it('should save a sub-achievement', async () => {
//       mockEntity.save.mockResolvedValue(mockSubAchievement);

//       const result = await subAchievementRepository.save(mockSubAchievement);
//       expect(result).toEqual(mockSubAchievement);
//       expect(mockEntity.save).toHaveBeenCalledWith(mockSubAchievement);
//     });
//   });

//   describe('delete_achievement_c', () => {
//     it('should delete related achievement_c records', async () => {
//       mockEntityC.delete.mockResolvedValue({ affected: 1 });

//       await subAchievementRepository.delete_achievement_c(1);
//       expect(mockEntityC.delete).toHaveBeenCalledWith({ achievement_id: 1 });
//     });
//   });

//   describe('findOne', () => {
//     it('should find a sub-achievement by id', async () => {
//       mockEntity.findOne.mockResolvedValue(mockSubAchievement);

//       const result = await subAchievementRepository.findOne(1);
//       expect(result).toEqual(mockSubAchievement);
//       expect(mockEntity.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         withDeleted: false,
//       });
//     });
//   });

//   describe('update', () => {
//     it('should update a sub-achievement', async () => {
//       mockEntity.update.mockResolvedValue({ affected: 1 });

//       await subAchievementRepository.update(1, { title: 'Updated' });
//       expect(mockEntity.update).toHaveBeenCalledWith(1, { title: 'Updated' });
//     });
//   });

//   describe('softDelete', () => {
//     it('should soft delete a sub-achievement', async () => {
//       mockEntity.softDelete.mockResolvedValue({ affected: 1 });

//       await subAchievementRepository.softDelete(1);
//       expect(mockEntity.softDelete).toHaveBeenCalledWith(1);
//     });
//   });
// });
