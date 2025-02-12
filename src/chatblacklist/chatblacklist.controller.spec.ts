import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistController } from './chatblacklist.controller';
import { ChatblacklistService } from './chatblacklist.service';

describe('ChatblacklistController', () => {
  let controller: ChatblacklistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatblacklistController],
      providers: [ChatblacklistService],
    }).compile();

    controller = module.get<ChatblacklistController>(ChatblacklistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
