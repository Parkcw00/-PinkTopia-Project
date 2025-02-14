import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPRepository } from './achievement-p.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {AchievementP} from './entities/achievement-p.entity';

describe('AchievementPRepository', () => {
  let repository: AchievementPRepository;
  let mockRepo: Repository<AchievementP>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementPRepository,
        {
          provide: getRepositoryToken(AchievementP),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<AchievementPRepository>(AchievementPRepository);
    mockRepo = module.get<Repository<AchievementP>>(getRepositoryToken(AchievementP));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('findById should return an achievement', async () => {
    const achievement = new AchievementP();
    jest.spyOn(mockRepo, 'findOne').mockResolvedValue(achievement);

    const result = await repository.findById(1);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(achievement);
  });
});
