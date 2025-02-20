import { Module } from '@nestjs/common';
import { ChatmemberService } from './chatmember.service';
import { ChatmemberController } from './chatmember.controller';
import { ChatmemberRepository } from './chatmember.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatmember } from './entities/chatmember.entity';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/entities/user.entity';
import { ChattingModule } from 'src/chatting/chatting.module';
import { UserModule } from 'src/user/user.module';
import { ChattingRoomModule } from 'src/chattingroom/chattingroom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatmember, User]),
    ChattingModule,
    UserModule,
    ChattingRoomModule,
  ],
  controllers: [ChatmemberController],
  providers: [ChatmemberService, ChatmemberRepository, UserRepository],
})
export class ChatmemberModule {}
