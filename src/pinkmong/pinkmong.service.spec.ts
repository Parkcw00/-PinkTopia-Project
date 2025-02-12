import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongService } from './pinkmong.service';

describe('PinkmongService', () => {
  let service: PinkmongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PinkmongService],
    }).compile();

    service = module.get<PinkmongService>(PinkmongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
