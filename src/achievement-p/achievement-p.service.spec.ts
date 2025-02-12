import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPService } from './achievement-p.service';

describe('AchievementPService', () => {
  let service: AchievementPService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementPService],
    }).compile();

    service = module.get<AchievementPService>(AchievementPService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
