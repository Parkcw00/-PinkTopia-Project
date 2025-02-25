import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementRepository } from './sub-achievement.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubAchievement } from './entities/sub-achievement.entity';

describe('SubAchievementRepository', () => {
  let repository: SubAchievementRepository;
  let mockRepo: Repository<SubAchievement>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubAchievementRepository,
        {
          provide: getRepositoryToken(SubAchievement),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<SubAchievementRepository>(SubAchievementRepository);
    mockRepo = module.get<Repository<SubAchievement>>(getRepositoryToken(SubAchievement));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('findAll should call repository.find()', async () => {
    const findSpy = jest.spyOn(mockRepo, 'find').mockResolvedValue([]);
    const result = await repository.findAll();
    expect(findSpy).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('create should call repository.save()', async () => {
    const subAchievement = new SubAchievement();
    jest.spyOn(mockRepo, 'save').mockResolvedValue(subAchievement);

    const result = await repository.createSubAchievement(subAchievement);
    expect(mockRepo.save).toHaveBeenCalledWith(subAchievement);
    expect(result).toEqual(subAchievement);
  });
});
