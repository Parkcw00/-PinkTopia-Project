// import { Test, TestingModule } from '@nestjs/testing';
// import { AchievementRepository } from './achievement.repository';
// import { Repository } from 'typeorm';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Achievement } from './entities/achievement.entity';
// import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
// import { AchievementCategory } from './enums/achievement-category.enum';
// import { jest } from '@jest/globals';

// describe('AchievementRepository', () => {
//   let repository: AchievementRepository;
//   let entity: Repository<Achievement>;
//   let subEntity: Repository<SubAchievement>;

//   const mockAchievement = {
//     id: 1,
//     title: 'Test Achievement',
//     reward: { gam: 100, dia: 3 },
//     category: AchievementCategory.CHALLENGE,
//     expiration_at: '2025.05.22',
//   };
//   const mockSubAchievement = { id: 1, achievement_id: 1 };
//   const mockRepository = () => ({
//     findOne: jest.fn().mockResolvedValue(),
//     create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 1 })), // 생성 시 id 추가
//     save: jest.fn().mockResolvedValue(mockAchievement),
//     find: jest.fn().mockResolvedValue([mockAchievement]),
//     softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
//     update: jest.fn(),
//   });

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AchievementRepository,
//         {
//           provide: getRepositoryToken(Achievement),
//           useValue: mockRepository(),
//         },
//         {
//           provide: getRepositoryToken(SubAchievement),
//           useValue: mockRepository(),
//         },
//       ],
//     }).compile();

//     repository = module.get<AchievementRepository>(AchievementRepository);
//     entity = module.get(getRepositoryToken(Achievement));
//     //  subEntity = module.get(getRepositoryToken(SubAchievement));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(repository).toBeDefined();
//   });

//   describe('findOne', () => {
//     it('should return an Achievement by id', async () => {
//       entity.findOne.mockResolvedValue(mockAchievement);
//       const result = await repository.findOne(1);
//       expect(result).toEqual(mockAchievement);
//       expect(entity.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     });
//   });

//   describe('create and save', () => {
//     it('should create and save an Achievement', async () => {
//       entity.save.mockResolvedValue(mockAchievement);
//       const data = {
//         title: 'Test Achievement',
//         category: AchievementCategory.CHALLENGE,
//       };
//       const created = await repository.create(data);
//       expect(created).toEqual(mockAchievement);
//       expect(entity.save).toHaveBeenCalledWith(expect.objectContaining(data));
//     });
//   });

//   describe('findByAId', () => {
//     it('should return SubAchievements by achievement id', async () => {
//       subEntity.find.mockResolvedValue([mockSubAchievement]);
//       const result = await repository.findByAId(1);
//       expect(result).toEqual([mockSubAchievement]);
//       expect(subEntity.find).toHaveBeenCalledWith({
//         where: { achievement_id: 1 },
//         order: { updated_at: 'DESC', created_at: 'DESC' },
//       });
//     });
//   });

//   describe('findAll', () => {
//     it('should return all Achievements', async () => {
//       entity.find.mockResolvedValue([mockAchievement]);
//       const result = await repository.findAll();
//       expect(result).toEqual([mockAchievement]);
//       expect(entity.find).toHaveBeenCalledWith({
//         order: { created_at: 'DESC' },
//       });
//     });
//   });

//   describe('softDelete', () => {
//     it('should soft delete an Achievement', async () => {
//       entity.softDelete.mockResolvedValue({ affected: 1 });
//       await repository.softDelete(1);
//       expect(entity.softDelete).toHaveBeenCalledWith(1);
//     });
//   });
// });
