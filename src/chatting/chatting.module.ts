import { Module } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { ChattingController } from './chatting.controller';
import { ChattingRepository } from './chatting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatting } from './entities/chatting.entity';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyService } from 'src/valkey/valkey.service';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chatting, Chatmember]), ValkeyModule],
  controllers: [ChattingController],
  providers: [ChattingService, ChattingRepository, S3Service, ValkeyService],
})
export class ChattingModule {}
