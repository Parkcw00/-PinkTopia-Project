import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongController } from './pinkmong.controller';
import { PinkmongService } from './pinkmong.service';

describe('PinkmongController', () => {
  let controller: PinkmongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinkmongController],
      providers: [PinkmongService],
    }).compile();

    controller = module.get<PinkmongController>(PinkmongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
