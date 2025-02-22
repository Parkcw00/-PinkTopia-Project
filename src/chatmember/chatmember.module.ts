import { Module } from '@nestjs/common';
import { ChatmemberService } from './chatmember.service';
import { ChatmemberController } from './chatmember.controller';
import { ChatmemberRepository } from './chatmember.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatmember } from './entities/chatmember.entity';
import { User } from 'src/user/entities/user.entity';
import { ChattingModule } from 'src/chatting/chatting.module';
import { UserModule } from 'src/user/user.module';
import { ChattingRoomModule } from 'src/chattingroom/chattingroom.module';
import { ChatblacklistModule } from 'src/chatblacklist/chatblacklist.module';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatmember, User]),
    ChattingModule,
    UserModule,
    ChattingRoomModule,
    ChatblacklistModule,
    ValkeyModule,
  ],
  controllers: [ChatmemberController],
  providers: [ChatmemberService, ChatmemberRepository],
})
export class ChatmemberModule {}
