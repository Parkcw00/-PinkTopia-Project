// import { Test, TestingModule } from '@nestjs/testing';
// import { AchievementPRepository } from './achievement-p.repository';
// import { DataSource, Repository } from 'typeorm';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { AchievementP } from './entities/achievement-p.entity';
// import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
// import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
// import { User } from '../user/entities/user.entity';
// import { Achievement } from '../achievement/entities/achievement.entity';

// describe('AchievementPRepository', () => {
//   let repository: AchievementPRepository;
//   let entityP: Repository<AchievementP>;
//   let entityS: Repository<SubAchievement>;
//   let entityC: Repository<AchievementC>;
//   let entityU: Repository<User>;
//   let entityA: Repository<Achievement>;

//   const mockAchievementP = {
//     id: 1,
//     user_id: 1,
//     sub_achievement_id: 1,
//     complete: true,
//   };
//   const mockSubAchievement = { id: 1, achievement_id: 1 };
//   const mockAchievementC = { id: 1, user_id: 1, achievement_id: 1 };
//   const mockUser = { id: 1, pink_gem: 0, pink_dia: 0 };
//   const mockAchievement = { id: 1, reward: '{"gem": 100, "dia": 3}' };

//   const mockDataSource = { createQueryRunner: jest.fn().mockReturnValue({}) };

//   const mockRepository = (entity) => ({
//     find: jest.fn(),
//     findOne: jest.fn(),
//     create: jest.fn().mockReturnValue(entity),
//     save: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//     createQueryBuilder: jest.fn().mockReturnValue({
//       update: jest.fn().mockReturnThis(),
//       set: jest.fn().mockReturnThis(),
//       where: jest.fn().mockReturnThis(),
//       setParameter: jest.fn().mockReturnThis(),
//       execute: jest.fn(),
//     }),
//   });

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AchievementPRepository,
//         { provide: 'DATA_SOURCE', useValue: mockDataSource },
//         {
//           provide: getRepositoryToken(AchievementP),
//           useValue: mockRepository(mockAchievementP),
//         },
//         {
//           provide: getRepositoryToken(SubAchievement),
//           useValue: mockRepository(mockSubAchievement),
//         },
//         {
//           provide: getRepositoryToken(AchievementC),
//           useValue: mockRepository(mockAchievementC),
//         },
//         {
//           provide: getRepositoryToken(User),
//           useValue: mockRepository(mockUser),
//         },
//         {
//           provide: getRepositoryToken(Achievement),
//           useValue: mockRepository(mockAchievement),
//         },
//       ],
//     }).compile();

//     repository = module.get<AchievementPRepository>(AchievementPRepository);
//     entityP = module.get(getRepositoryToken(AchievementP));
//     entityS = module.get(getRepositoryToken(SubAchievement));
//     entityC = module.get(getRepositoryToken(AchievementC));
//     entityU = module.get(getRepositoryToken(User));
//     entityA = module.get(getRepositoryToken(Achievement));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(repository).toBeDefined();
//   });

//   describe('findPByUser', () => {
//     it('should return an array of AchievementP for a user', async () => {
//       entityP.find.mockResolvedValue([mockAchievementP]);
//       const result = await repository.findPByUser(1);
//       expect(result).toEqual([mockAchievementP]);
//       expect(entityP.find).toHaveBeenCalledWith({ where: { user_id: 1 } });
//     });
//   });

//   describe('findSub', () => {
//     it('should return a SubAchievement by id', async () => {
//       entityS.findOne.mockResolvedValue(mockSubAchievement);
//       const result = await repository.findSub(1);
//       expect(result).toEqual(mockSubAchievement);
//       expect(entityS.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     });
//   });

//   describe('createP and save', () => {
//     it('should create and save an AchievementP', async () => {
//       entityP.save.mockResolvedValue(mockAchievementP);
//       const data = { user_id: 1, sub_achievement_id: 1 };
//       const created = await repository.createP(data);
//       const saved = await repository.save(created);
//       expect(created).toEqual(mockAchievementP);
//       expect(saved).toEqual(mockAchievementP);
//       expect(entityP.create).toHaveBeenCalledWith(data);
//       expect(entityP.save).toHaveBeenCalledWith(mockAchievementP);
//     });
//   });

//   describe('reward', () => {
//     it('should return parsed reward data', async () => {
//       entityA.findOne.mockResolvedValue(mockAchievement);
//       const result = await repository.reward(1);
//       expect(result).toEqual({ reward: { gem: 100, dia: 3 } });
//       expect(entityA.findOne).toHaveBeenCalledWith({
//         where: { id: 1 },
//         select: ['reward'],
//       });
//     });
//   });

//   describe('gem', () => {
//     it('should update user pink_gem', async () => {
//       const qb = entityU.createQueryBuilder();
//       qb.execute.mockResolvedValue({ affected: 1 });
//       await repository.gem(1, 100);
//       expect(qb.update).toHaveBeenCalled();
//       expect(qb.set).toHaveBeenCalledWith({ pink_gem: expect.any(Function) });
//       expect(qb.setParameter).toHaveBeenCalledWith('gem', 100);
//     });
//   });

//   describe('delete', () => {
//     it('should delete an AchievementP', async () => {
//       entityP.delete.mockResolvedValue({ affected: 1 });
//       await repository.delete(1);
//       expect(entityP.delete).toHaveBeenCalledWith(1);
//     });
//   });
// });
