import { Module } from '@nestjs/common';
import { ChatblacklistService } from './chatblacklist.service';
import { ChatblacklistController } from './chatblacklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatblacklist } from './entities/chatblacklist.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { ChatblacklistRepository } from './chatblacklist.repository';
import { ChattingRoomModule } from 'src/chattingroom/chattingroom.module';
import { ValkeyModule } from 'src/valkey/valkey.module';
import { ChatblacklistGateway } from './chatblacklist.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatblacklist, User]),
    UserModule,
    ChattingRoomModule,
    ValkeyModule,
  ],
  controllers: [ChatblacklistController],
  providers: [
    ChatblacklistService,
    ChatblacklistRepository,
    ChatblacklistGateway,
  ],
  exports: [ChatblacklistRepository, ChatblacklistService],
})
export class ChatblacklistModule {}
