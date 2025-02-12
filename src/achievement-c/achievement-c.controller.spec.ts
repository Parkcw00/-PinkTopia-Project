import { Test, TestingModule } from '@nestjs/testing';
import { AchievementCController } from './achievement-c.controller';
import { AchievementCService } from './achievement-c.service';

describe('AchievementCController', () => {
  let controller: AchievementCController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementCController],
      providers: [AchievementCService],
    }).compile();

    controller = module.get<AchievementCController>(AchievementCController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
