import { Test, TestingModule } from '@nestjs/testing';
import { CatchPinkmongController } from './catch_pinkmong.controller';
import { CatchPinkmongService } from './catch_pinkmong.service';

describe('CatchPinkmongController', () => {
  let controller: CatchPinkmongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatchPinkmongController],
      providers: [CatchPinkmongService],
    }).compile();

    controller = module.get<CatchPinkmongController>(CatchPinkmongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
