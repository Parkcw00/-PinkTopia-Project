import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCRepository } from './achievement-c.repository';
import { Repository, DeleteResult } from 'typeorm';
import { AchievementC } from './entities/achievement-c.entity';
import { AchievementP } from '../achievement-p/entities/achievement-p.entity';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AchievementCRepository', () => {
  let repository: AchievementCRepository;
  let achievementCRepo: Repository<AchievementC>;
  let achievementPRepo: Repository<AchievementP>;
  let userRepo: Repository<User>;

  // TypeORM Repository를 모킹하여 실제 DB에 접근하지 않고 메서드 동작만 검증
  const mockAchievementCRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockAchievementPRepo = {
    find: jest.fn(),
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // 테스트 모듈 생성 시 각 엔티티의 Repository를 모킹하여 주입
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementCRepository,
        {
          provide: getRepositoryToken(AchievementC),
          useValue: mockAchievementCRepo,
        },
        {
          provide: getRepositoryToken(AchievementP),
          useValue: mockAchievementPRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    repository = module.get<AchievementCRepository>(AchievementCRepository);
    achievementCRepo = module.get<Repository<AchievementC>>(getRepositoryToken(AchievementC));
    achievementPRepo = module.get<Repository<AchievementP>>(getRepositoryToken(AchievementP));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    // 테스트 후 모킹 초기화
    jest.clearAllMocks();
  });

  describe('isExists', () => {
    it('user_id와 achievement_id가 일치하는 항목이 존재하면 해당 엔티티를 반환해야 한다', async () => {
      const user_id = 1;
      const achievement_id = 1;
      const expectedAchievement = { id: 1, user_id, achievement_id };
      mockAchievementCRepo.findOne.mockResolvedValue(expectedAchievement);

      const result = await repository.isExists(user_id, achievement_id);
      expect(result).toEqual(expectedAchievement);
      expect(mockAchievementCRepo.findOne).toHaveBeenCalledWith({ where: { user_id, achievement_id } });
    });
  });

  describe('create and save', () => {
    it('새로운 achievementC 엔티티를 생성하고 저장해야 한다', async () => {
      const data = { user_id: 1, achievement_id: 1 };
      const createdEntity = { id: 1, ...data };
      // create 메서드가 새로운 엔티티를 반환하도록 모킹
      mockAchievementCRepo.create.mockResolvedValue(createdEntity);
      // save 메서드가 저장된 엔티티를 반환하도록 모킹
      mockAchievementCRepo.save.mockResolvedValue(createdEntity);

      const created = await repository.create(data);
      expect(created).toEqual(createdEntity);
      expect(mockAchievementCRepo.create).toHaveBeenCalledWith(data);

      const saved = await repository.save(created);
      expect(saved).toEqual(createdEntity);
      expect(mockAchievementCRepo.save).toHaveBeenCalledWith(createdEntity);
    });
  });

  describe('findTitleC', () => {
    it('id에 해당하는 achievementC의 title을 반환해야 한다', async () => {
      const id = 1;
      const expectedTitle = 'Achievement Title';
      const achievementCP = { achievement: { title: expectedTitle } };
      mockAchievementCRepo.findOne.mockResolvedValue(achievementCP);

      const result = await repository.findTitleC(id);
      expect(result).toEqual(expectedTitle);
      expect(mockAchievementCRepo.findOne).toHaveBeenCalledWith({ where: { achievement_id: id }, relations: ['achievement'] });
    });
  });

  describe('findP', () => {
    it('id에 해당하는 서브업적들을 반환해야 한다', async () => {
      const id = 1;
      const expectedSubAchievements = [{ id: 1, name: 'SubAchievement1' }];
      mockAchievementPRepo.find.mockResolvedValue(expectedSubAchievements);

      const result = await repository.findP(id);
      expect(result).toEqual(expectedSubAchievements);
      expect(mockAchievementPRepo.find).toHaveBeenCalledWith({ where: { achievement_id: id } });
    });
  });

  describe('findAll', () => {
    it('생성일 기준 오름차순으로 정렬된 모든 achievementC를 반환해야 한다', async () => {
      const achievements = [{ id: 1 }, { id: 2 }];
      mockAchievementCRepo.find.mockResolvedValue(achievements);

      const result = await repository.findAll();
      expect(result).toEqual(achievements);
      expect(mockAchievementCRepo.find).toHaveBeenCalledWith({ order: { created_at: 'ASC' } });
    });
  });

  describe('remove', () => {
    it('주어진 id를 가진 항목을 삭제하고 DeleteResult를 반환해야 한다', async () => {
      const id = 1;
      const deleteResult: DeleteResult = { affected: 1, raw: [] };
      mockAchievementCRepo.delete.mockResolvedValue(deleteResult);

      const result = await repository.remove(id);
      expect(result).toEqual(deleteResult);
      expect(mockAchievementCRepo.delete).toHaveBeenCalledWith(id);
    });
  });
});
