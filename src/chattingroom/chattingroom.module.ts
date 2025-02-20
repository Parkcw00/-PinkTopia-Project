import { Module } from '@nestjs/common';
import { ChattingRoomService } from './chattingroom.service';
import { ChattingRoomController } from './chattingroom.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChattingRoom } from './entities/chattingroom.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { ChattingRoomRepository } from './chattingroom.repository';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChattingRoom, Chatmember, User])],
  controllers: [ChattingRoomController],
  providers: [ChattingRoomService, ChattingRoomRepository],
  exports: [ChattingRoomRepository],
})
export class ChattingRoomModule {}
