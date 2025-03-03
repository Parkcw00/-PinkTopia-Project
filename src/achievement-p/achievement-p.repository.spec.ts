import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPRepository } from './achievement-p.repository';
import { Repository } from 'typeorm';
import { AchievementP } from './entities/achievement-p.entity';
import { Achievement } from '../achievement/entities/achievement.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { User } from '../user/entities/user.entity';

describe('AchievementPRepository', () => {
  let repository: AchievementPRepository;

  // 각 TypeORM Repository의 메소드를 모의하기 위한 함수입니다.
  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(true),
    }),
  });

  beforeEach(async () => {
    // 테스트 모듈에 각 엔티티별 Repository 모의 객체를 주입합니다.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementPRepository,
        { provide: 'AchievementRepository', useFactory: mockRepository },
        { provide: 'AchievementPRepository', useFactory: mockRepository },
        { provide: 'AchievementCRepository', useFactory: mockRepository },
        { provide: 'SubAchievementRepository', useFactory: mockRepository },
        { provide: 'UserRepository', useFactory: mockRepository },
      ],
    })
    .overrideProvider('AchievementRepository')
    .useValue(mockRepository())
    .overrideProvider('AchievementPRepository')
    .useValue(mockRepository())
    .overrideProvider('AchievementCRepository')
    .useValue(mockRepository())
    .overrideProvider('SubAchievementRepository')
    .useValue(mockRepository())
    .overrideProvider('UserRepository')
    .useValue(mockRepository())
    .compile();

    // AchievementPRepository 인스턴스를 가져온 후, 각 내부 Repository를 할당합니다.
    repository = module.get<AchievementPRepository>(AchievementPRepository);
    (repository as any)['entityA'] = module.get('AchievementRepository');
    (repository as any)['entityP'] = module.get('AchievementPRepository');
    (repository as any)['entityC'] = module.get('AchievementCRepository');
    (repository as any)['entityS'] = module.get('SubAchievementRepository');
    (repository as any)['entityU'] = module.get('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // findPByUser 메소드 테스트: user_id를 기준으로 데이터를 찾는지 확인합니다.
  describe('findPByUser', () => {
    it('findPByUser는 entityP.find를 호출하여 데이터를 반환해야 함', async () => {
      const fakeData = [{ id: 1, user_id: 1 }];
     (repository['entityP'].find as jest.Mock).mockResolvedValue(fakeData);
      const result = await repository.findPByUser(1);
      expect(repository['entityP'].find).toHaveBeenCalledWith({ where: { user_id: 1 } });
      expect(result).toEqual(fakeData);
    });
  });

  // findSub 메소드 테스트: 서브업적 데이터를 찾습니다.
  describe('findSub', () => {
    it('findSub는 entityS.findOne을 호출하여 데이터를 반환해야 함', async () => {
      const fakeData = { id: 101 };
      (repository['entityS'].findOne as jest.Mock).mockResolvedValue(fakeData);
      const result = await repository.findSub(101);
      expect(repository['entityS'].findOne).toHaveBeenCalledWith({ where: { id: 101 } });
      expect(result).toEqual(fakeData);
    });
  });

  // findPByUserNSub 메소드 테스트: user_id와 sub_achievement_id를 동시에 조건으로 데이터를 찾습니다.
  describe('findPByUserNSub', () => {
    it('findPByUserNSub는 entityP.findOne을 호출하여 데이터를 반환해야 함', async () => {
      const fakeData = { id: 1, user_id: 1, sub_achievement_id: 101 };
      (repository['entityP'].findOne as jest.Mock).mockResolvedValue(fakeData);
      const result = await repository.findPByUserNSub(1, 101);
      expect(repository['entityP'].findOne).toHaveBeenCalledWith({ where: { user_id: 1, sub_achievement_id: 101 } });
      expect(result).toEqual(fakeData);
    });
  });

  // createP와 save 메소드 테스트: 엔티티 생성 후 저장하는지 확인합니다.
  describe('createP and save', () => {
    it('createP는 entityP.create를 호출해야 함', async () => {
      const data = { user_id: 1, sub_achievement_id: 101 };
      const fakeEntity = { ...data, id: 1 };
      (repository['entityP'].create as jest.Mock).mockReturnValue(fakeEntity);
      const result = await repository.createP(data);
      expect(repository['entityP'].create).toHaveBeenCalledWith(data);
      expect(result).toEqual(fakeEntity);
    });

    it('save는 entityP.save를 호출해야 함', async () => {
      const entity = { id: 1 } as unknown as AchievementP;
      (repository['entityP'].save as jest.Mock).mockResolvedValue(entity);
      const result = await repository.save(entity);
      expect(repository['entityP'].save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  // subAllByA 메소드 테스트: 특정 achievement_id에 해당하는 서브업적 목록 조회
  describe('subAllByA', () => {
    it('subAllByA는 entityS.find를 호출해야 함', async () => {
      const fakeData = [{ id: 101 }];
      (repository['entityS'].find as jest.Mock).mockResolvedValue(fakeData);
      const result = await repository.subAllByA(1001);
      expect(repository['entityS'].find).toHaveBeenCalledWith({ where: { achievement_id: 1001 } });
      expect(result).toEqual(fakeData);
    });
  });

  // pAllByA 메소드 테스트: 특정 achievement_id에 해당하는 P 목록 조회
  describe('pAllByA', () => {
    it('pAllByA는 entityP.find를 호출해야 함', async () => {
      const fakeData = [{ sub_achievement_id: 101 }];
      (repository['entityP'].find as jest.Mock).mockResolvedValue(fakeData);
      const result = await repository.pAllByA(1001);
      expect(repository['entityP'].find).toHaveBeenCalledWith({ where: { achievement_id: 1001 } });
      expect(result).toEqual(fakeData);
    });
  });

  // updateP 메소드 테스트: complete 값을 true로 업데이트하는지 확인
  describe('updateP', () => {
    it('updateP는 entityP.update를 호출해야 함', async () => {
      (repository['entityP'].update as jest.Mock).mockResolvedValue(true);
      await repository.updateP(1);
      expect(repository['entityP'].update).toHaveBeenCalledWith(1, { complete: true });
    });
  });

  // delete 메소드 테스트: 데이터 삭제가 정상적으로 호출되는지 확인
  describe('delete', () => {
    it('delete는 entityP.delete를 호출해야 함', async () => {
      (repository['entityP'].delete as jest.Mock).mockResolvedValue(true);
      await repository.delete(1);
      expect(repository['entityP'].delete).toHaveBeenCalledWith(1);
    });
  });

  // createC와 saveC 메소드 테스트: 업적 완료 엔티티 생성 및 저장
  describe('createC and saveC', () => {
    it('createC는 entityC.create를 호출한 후, 저장하여 반환해야 함', async () => {
      const data = { user_id: 1, achievement_id: 1001 };
      const fakeC = { id: 10, ...data };
      (repository['entityC'].create as jest.Mock).mockReturnValue(fakeC);
      (repository['entityC'].save as jest.Mock).mockResolvedValue(fakeC);
      const result = await repository.createC(data);
      expect(repository['entityC'].create).toHaveBeenCalledWith(data);
      expect(result).toEqual(fakeC);
    });

    it('saveC는 entityC.save를 호출해야 함', async () => {
      const entity = { id: 10 } as unknown as AchievementC;
      (repository['entityC'].save as jest.Mock).mockResolvedValue(entity);
      const result = await repository.saveC(entity);
      expect(repository['entityC'].save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  // reward 메소드 테스트: 보상 정보를 조회하는지 확인
  describe('reward', () => {
    it('reward는 entityA.findOne을 호출하여 reward를 반환해야 함', async () => {
      const fakeReward = { reward: { gem: 5, dia: 3 } };
      (repository['entityA'].findOne as jest.Mock).mockResolvedValue({ id: 1001, reward: fakeReward.reward });
      const result = await repository.reward(1001);
      expect(repository['entityA'].findOne).toHaveBeenCalledWith({ where: { id: 1001 }, select: ['reward'] });
      expect(result).toEqual({ reward: fakeReward.reward });
    });

    it('reward는 achievement가 없을 경우 null을 반환해야 함', async () => {
      (repository['entityA'].findOne as jest.Mock).mockResolvedValue(null);
      const result = await repository.reward(1001);
      expect(result).toEqual({ reward: null });
    });
  });

  // gem 메소드 테스트: 사용자의 pink_gem 업데이트가 호출되는지 확인
  describe('gem', () => {
    it('gem은 pink_gem을 업데이트해야 함', async () => {
      const queryBuilder = repository['entityU'].createQueryBuilder();
      await repository.gem(1, 5);
      expect(queryBuilder.update).toHaveBeenCalled();
    });
  });

  // dia 메소드 테스트: 사용자의 pink_dia 업데이트가 호출되는지 확인
  describe('dia', () => {
    it('dia는 pink_dia를 업데이트해야 함', async () => {
      const queryBuilder = repository['entityU'].createQueryBuilder();
      await repository.dia(1, 3);
      expect(queryBuilder.update).toHaveBeenCalled();
    });
  });
});
