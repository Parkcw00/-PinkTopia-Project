import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCRepository } from './achievement-c.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {AchievementC} from './entities/achievement-c.entity';

describe('AchievementCRepository', () => {
  let repository: AchievementCRepository;
  let mockRepo: Repository<AchievementC>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementCRepository,
        {
          provide: getRepositoryToken(AchievementC),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<AchievementCRepository>(AchievementCRepository);
    mockRepo = module.get<Repository<AchievementC>>(getRepositoryToken(AchievementC));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('findAll should call repository.find()', async () => {
    jest.spyOn(mockRepo, 'find').mockResolvedValue([]);
    const result = await repository.findAll();
    expect(mockRepo.find).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
