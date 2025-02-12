import { Test, TestingModule } from '@nestjs/testing';
import { ChattingroomService } from './chattingroom.service';

describe('ChattingroomService', () => {
  let service: ChattingroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChattingroomService],
    }).compile();

    service = module.get<ChattingroomService>(ChattingroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
