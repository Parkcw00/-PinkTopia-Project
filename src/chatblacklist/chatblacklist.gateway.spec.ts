import { Test, TestingModule } from '@nestjs/testing';
import { ChatblacklistGateway } from './chatblacklist.gateway';

describe('ChatblacklistGateway', () => {
  let gateway: ChatblacklistGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatblacklistGateway],
    }).compile();

    gateway = module.get<ChatblacklistGateway>(ChatblacklistGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
