// import { Test, TestingModule } from '@nestjs/testing';
// import { AchievementCRepository } from './achievement-c.repository';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { AchievementC } from './entities/achievement-c.entity';
// import { AchievementP } from '../achievement-p/entities/achievement-p.entity';
// import { User } from '../user/entities/user.entity';
// import { Repository } from 'typeorm';

// describe('AchievementCRepository', () => {
//   let achievementCRepository: AchievementCRepository;
//   let achievementCRepoMock: Repository<AchievementC>;
//   let achievementPRepoMock: Repository<AchievementP>;
//   let userRepoMock: Repository<User>;
//   const mockRepository = {
//     findOne: jest.fn(),  // 반드시 jest.fn()으로 초기화
//     create: jest.fn().mockReturnValue(mockAchievementC),
//     save: jest.fn(),
//     find: jest.fn(),
//     delete: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AchievementCRepository,
//         {
//           provide: getRepositoryToken(AchievementC),
//           useValue: mockRepository, // 수정된 부분
//         },
//         {
//           provide: getRepositoryToken(AchievementP),
//           useValue: mockRepository,
//         },
//         {
//           provide: getRepositoryToken(User),
//           useValue: mockRepository,
//         },
//       ],
//     }).compile();

//     repository = module.get<AchievementCRepository>(AchievementCRepository);
//     entityC = module.get(getRepositoryToken(AchievementC));
//     entityP = module.get(getRepositoryToken(AchievementP));
//   });

// })

//   /**test("테스트 설명", () => {
//     expect("검증 대상").toXxx("기대 결과");
//   }); */

//   /**
//     // 존재여부확인. 유저id, 업적id
//     async isExists(user_id:number, achievement_id:number): Promise<AchievementC | null>{
//       return await this.entityC.findOne({ where: { user_id, achievement_id} });
//     } */

//       user_id:number,
//       achievement_id:number

//       user_id = 3,
//       achievement_id =1
//       test("유저id, 업적id로 존재여부확인.", () => {
//         expect(isExists(user_id,achievement_id)).toXxx({id:12
//           user_id:3
//           achievement_id:1
//           created_at:07:00:38.930046    }||null);}
