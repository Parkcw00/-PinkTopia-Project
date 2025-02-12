import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCService } from './achievement-c.service';

describe('AchievementCService', () => {
  let service: AchievementCService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AchievementCService],
    }).compile();

    service = module.get<AchievementCService>(AchievementCService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
