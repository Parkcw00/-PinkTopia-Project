import { Module } from '@nestjs/common';
import { ChatblacklistService } from './chatblacklist.service';
import { ChatblacklistController } from './chatblacklist.controller';

@Module({
  controllers: [ChatblacklistController],
  providers: [ChatblacklistService],
})
export class ChatblacklistModule {}
