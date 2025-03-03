import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementRepository } from './sub-achievement.repository';
import { Repository } from 'typeorm';
import { SubAchievement } from './entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SubAchievementRepository', () => {
  let repository: SubAchievementRepository;
  let subAchievementRepo: Repository<SubAchievement>;
  let achievementCRepo: Repository<AchievementC>;

  // 모의 데이터 생성 (테스트용 샘플 데이터)
  const subAchievementMock = { id: 1, title: '테스트 업적' } as SubAchievement;

  beforeEach(async () => {
    // NestJS의 TestingModule을 생성하여 각 의존성을 주입합니다.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubAchievementRepository,
        {
          provide: getRepositoryToken(SubAchievement),
          useValue: {
            find: jest.fn().mockResolvedValue([subAchievementMock]),
            findOne: jest.fn().mockResolvedValue(subAchievementMock),
            create: jest.fn().mockReturnValue(subAchievementMock),
            save: jest.fn().mockResolvedValue(subAchievementMock),
            update: jest.fn().mockResolvedValue(null),
            softDelete: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(AchievementC),
          useValue: {
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    repository = module.get<SubAchievementRepository>(SubAchievementRepository);
    subAchievementRepo = module.get<Repository<SubAchievement>>(getRepositoryToken(SubAchievement));
    achievementCRepo = module.get<Repository<AchievementC>>(getRepositoryToken(AchievementC));
  });

  // getAll() 메서드가 repository.find()를 호출하여 전체 데이터를 반환하는지 테스트
  it('getAll() 메서드는 모든 서브업적을 반환해야 합니다.', async () => {
    const result = await repository.getAll();
    expect(result).toEqual([subAchievementMock]);
    expect(subAchievementRepo.find).toHaveBeenCalled();
  });

  // findByTitle() 메서드가 title 조건으로 단일 데이터를 검색하는지 테스트
  it('findByTitle() 메서드는 타이틀로 서브업적을 찾을 수 있어야 합니다.', async () => {
    const result = await repository.findByTitle('테스트 업적');
    expect(result).toEqual(subAchievementMock);
    expect(subAchievementRepo.findOne).toHaveBeenCalledWith({ where: { title: '테스트 업적' } });
  });

  // create() 메서드가 주어진 데이터를 기반으로 엔티티 인스턴스를 생성하는지 테스트
  it('create() 메서드는 주어진 데이터를 기반으로 엔티티 인스턴스를 생성해야 합니다.', async () => {
    const result = await repository.create({ title: '새 업적' });
    expect(result).toEqual(subAchievementMock);
    expect(subAchievementRepo.create).toHaveBeenCalledWith({ title: '새 업적' });
  });

  // save() 메서드가 생성된 엔티티를 데이터베이스에 저장하는지 테스트
  it('save() 메서드는 엔티티를 저장하고 반환해야 합니다.', async () => {
    const result = await repository.save(subAchievementMock);
    expect(result).toEqual(subAchievementMock);
    expect(subAchievementRepo.save).toHaveBeenCalledWith(subAchievementMock);
  });

  // delete_achievement_c() 메서드가 연관된 AchievementC 데이터를 삭제하는지 테스트
  it('delete_achievement_c() 메서드는 achievement_c 엔티티의 데이터를 삭제해야 합니다.', async () => {
    const result = await repository.delete_achievement_c(1);
    expect(result).toEqual({ affected: 1 });
    expect(achievementCRepo.delete).toHaveBeenCalledWith({ achievement_id: 1 });
  });

  // findOne() 메서드가 id 기준으로 단일 엔티티를 조회하는지 테스트
  it('findOne() 메서드는 id로 단일 서브업적을 반환해야 합니다.', async () => {
    const result = await repository.findOne(1);
    expect(result).toEqual(subAchievementMock);
    expect(subAchievementRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, withDeleted: false });
  });

  // update() 메서드가 id와 DTO를 받아 업데이트를 수행하는지 테스트
  it('update() 메서드는 id와 DTO를 받아 업데이트를 수행해야 합니다.', async () => {
    await repository.update(1, { title: '업데이트 타이틀' });
    expect(subAchievementRepo.update).toHaveBeenCalledWith(1, { title: '업데이트 타이틀' });
  });

  // softDelete() 메서드가 소프트 삭제를 수행하는지 테스트
  it('softDelete() 메서드는 소프트 삭제를 수행해야 합니다.', async () => {
    await repository.softDelete(1);
    expect(subAchievementRepo.softDelete).toHaveBeenCalledWith(1);
  });
});
