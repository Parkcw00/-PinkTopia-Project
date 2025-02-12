import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementService } from './sub-achievement.service';

describe('SubAchievementController', () => {
  let controller: SubAchievementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubAchievementController],
      providers: [SubAchievementService],
    }).compile();

    controller = module.get<SubAchievementController>(SubAchievementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
