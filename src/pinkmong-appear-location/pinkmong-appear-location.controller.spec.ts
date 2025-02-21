import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';

describe('PinkmongAppearLocationController', () => {
  let controller: PinkmongAppearLocationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinkmongAppearLocationController],
      providers: [PinkmongAppearLocationService],
    }).compile();

    controller = module.get<PinkmongAppearLocationController>(PinkmongAppearLocationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
