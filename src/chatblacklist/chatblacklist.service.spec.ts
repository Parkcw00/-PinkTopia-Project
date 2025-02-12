import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistService } from './chatblacklist.service';

describe('ChatblacklistService', () => {
  let service: ChatblacklistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatblacklistService],
    }).compile();

    service = module.get<ChatblacklistService>(ChatblacklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
