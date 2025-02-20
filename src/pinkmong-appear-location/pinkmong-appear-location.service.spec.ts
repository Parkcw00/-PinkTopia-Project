import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';

describe('PinkmongAppearLocationService', () => {
  let service: PinkmongAppearLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PinkmongAppearLocationService],
    }).compile();

    service = module.get<PinkmongAppearLocationService>(PinkmongAppearLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
