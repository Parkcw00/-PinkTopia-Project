import { Module } from '@nestjs/common';
import { ChatblacklistService } from './chatblacklist.service';
import { ChatblacklistController } from './chatblacklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatblacklist } from './entities/chatblacklist.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { ChatmemberModule } from 'src/chatmember/chatmember.module';
import { ChatblacklistRepository } from './chatblacklist.repository';
import { UserRepository } from 'src/user/user.repository';
// import { ChattingRoomModule } from 'src/chattingroom/chattingroom.module';
// import { ChatmemberRepository } from 'src/chatmember/chatmember.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([Chatblacklist, User]),
    UserModule,
    ChatmemberModule,
    // ChattingRoomModule,
  ],
  controllers: [ChatblacklistController],
  providers: [
    ChatblacklistService,
    ChatblacklistRepository,
    UserRepository,
    // ChatmemberRepository,
  ],
})
export class ChatblacklistModule {}
