import { Module } from '@nestjs/common';
import { ChattingRoomService } from './chattingroom.service';
import { ChattingRoomController } from './chattingroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChattingRoom } from './entities/chattingroom.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { ChattingRoomRepository } from './chattingroom.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChattingRoom, Chatmember])],
  controllers: [ChattingRoomController],
  providers: [ChattingRoomService, ChattingRoomRepository],
  exports: [ChattingRoomRepository],
})
export class ChattingRoomModule {}
