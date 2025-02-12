import { Test, TestingModule } from '@nestjs/testing';
import { ChattingroomController } from './chattingroom.controller';
import { ChattingroomService } from './chattingroom.service';

describe('ChattingroomController', () => {
  let controller: ChattingroomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChattingroomController],
      providers: [ChattingroomService],
    }).compile();

    controller = module.get<ChattingroomController>(ChattingroomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
