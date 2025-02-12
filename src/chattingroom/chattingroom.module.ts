import { Module } from '@nestjs/common';
import { ChattingroomService } from './chattingroom.service';
import { ChattingroomController } from './chattingroom.controller';

@Module({
  controllers: [ChattingroomController],
  providers: [ChattingroomService],
})
export class ChattingroomModule {}
