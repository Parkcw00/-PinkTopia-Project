import { Test, TestingModule } from '@nestjs/testing';
import { ChatmemberService } from './chatmember.service';

describe('ChatmemberService', () => {
  let service: ChatmemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatmemberService],
    }).compile();

    service = module.get<ChatmemberService>(ChatmemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
