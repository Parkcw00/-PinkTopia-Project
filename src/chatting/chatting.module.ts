import { Module } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { ChattingController } from './chatting.controller';
import { ChattingRepository } from './chatting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatting } from './entities/chatting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chatting])],
  controllers: [ChattingController],
  providers: [ChattingService, ChattingRepository],
})
export class ChattingModule {}
