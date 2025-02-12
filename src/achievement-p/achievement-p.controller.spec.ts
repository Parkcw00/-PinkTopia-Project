import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPController } from './achievement-p.controller';
import { AchievementPService } from './achievement-p.service';

describe('AchievementPController', () => {
  let controller: AchievementPController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementPController],
      providers: [AchievementPService],
    }).compile();

    controller = module.get<AchievementPController>(AchievementPController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
