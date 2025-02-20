import { Test, TestingModule } from '@nestjs/testing';
import { ChattingRoomController } from './chattingroom.controller';
import { ChattingRoomService } from './chattingroom.service';

describe('ChattingRoomController', () => {
  let controller: ChattingRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChattingRoomController],
      providers: [ChattingRoomService],
    }).compile();

    controller = module.get<ChattingRoomController>(ChattingRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
