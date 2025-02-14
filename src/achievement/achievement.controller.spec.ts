import { Test, TestingModule } from '@nestjs/testing';
import { Achievementontroller } from './achievement.controller';
import { AchievementService } from './achievement.service';

describe('Achievementontroller', () => {
  let controller: Achievementontroller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Achievementontroller],
      providers: [AchievementService],
    }).compile();

    controller = module.get<Achievementontroller>(Achievementontroller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
