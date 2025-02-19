import { Test, TestingModule } from '@nestjs/testing';
import { AchievementRepository } from './achievement.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';

describe('AchievementRepository', () => {
  let repository: AchievementRepository;
  let mockRepo: Repository<Achievement>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementRepository,
        {
          provide: getRepositoryToken(Achievement),
          useClass: Repository,
        },
      ],
    }).compile();

    repository = module.get<AchievementRepository>(AchievementRepository);
    mockRepo = module.get<Repository<Achievement>>(getRepositoryToken(Achievement));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('deleteById should call repository.delete()', async () => {
    const deleteSpy = jest.spyOn(mockRepo, 'delete').mockResolvedValue({} as any);
    await repository.deleteById(1);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
