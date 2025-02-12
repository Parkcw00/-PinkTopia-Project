import { Test, TestingModule } from '@nestjs/testing';
import { ChatmemberController } from './chatmember.controller';
import { ChatmemberService } from './chatmember.service';

describe('ChatmemberController', () => {
  let controller: ChatmemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatmemberController],
      providers: [ChatmemberService],
    }).compile();

    controller = module.get<ChatmemberController>(ChatmemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
