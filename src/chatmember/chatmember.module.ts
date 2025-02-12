import { Module } from '@nestjs/common';
import { ChatmemberService } from './chatmember.service';
import { ChatmemberController } from './chatmember.controller';

@Module({
  controllers: [ChatmemberController],
  providers: [ChatmemberService],
})
export class ChatmemberModule {}
