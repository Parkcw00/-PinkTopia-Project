import { Test, TestingModule } from '@nestjs/testing';
import { ChattingRoomService } from './chattingroom.service';

describe('ChattingRoomService', () => {
  let service: ChattingRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChattingRoomService],
    }).compile();

    service = module.get<ChattingRoomService>(ChattingRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
