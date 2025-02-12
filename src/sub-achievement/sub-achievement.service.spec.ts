import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementService } from './sub-achievement.service';

describe('SubAchievementService', () => {
  let service: SubAchievementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubAchievementService],
    }).compile();

    service = module.get<SubAchievementService>(SubAchievementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
