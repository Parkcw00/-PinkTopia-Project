import { Test, TestingModule } from '@nestjs/testing';
import { CatchPinkmongService } from './catch_pinkmong.service';

describe('CatchPinkmongService', () => {
  let service: CatchPinkmongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatchPinkmongService],
    }).compile();

    service = module.get<CatchPinkmongService>(CatchPinkmongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
