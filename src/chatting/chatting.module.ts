import { Module, forwardRef } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { ChattingController } from './chatting.controller';
import { ChattingRepository } from './chatting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatting } from './entities/chatting.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { S3Service } from 'src/s3/s3.service';
import { ChattingGateway } from './chatting.gateway';
import { ChatmemberModule } from 'src/chatmember/chatmember.module';
import { ChatblacklistModule } from 'src/chatblacklist/chatblacklist.module';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatting, Chatmember]),
    forwardRef(() => ChatmemberModule),
    ChatblacklistModule,
    ValkeyModule,
  ],
  controllers: [ChattingController],
  providers: [ChattingService, ChattingRepository, S3Service, ChattingGateway],
  exports: [ChattingService, ChattingRepository],
})
export class ChattingModule {}
