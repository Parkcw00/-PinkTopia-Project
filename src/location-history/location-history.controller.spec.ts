import { Test, TestingModule } from '@nestjs/testing';
import { LocationHistoryController } from './location-history.controller';
import { LocationHistoryService } from './location-history.service';

describe('LocationHistoryController', () => {
  let controller: LocationHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationHistoryController],
      providers: [LocationHistoryService],
    }).compile();

    controller = module.get<LocationHistoryController>(LocationHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
