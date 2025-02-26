import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChattingService } from './chatting.service';
import { ChattingGateway } from './chatting.gateway';
import { ChattingRepository } from './chatting.repository';
import { Chatting } from './entities/chatting.entity';
import { Chatmember } from '../chatmember/entities/chatmember.entity';
import { ChatmemberModule } from '../chatmember/chatmember.module';
import { ChatblacklistModule } from '../chatblacklist/chatblacklist.module';
import { S3Module } from '../s3/s3.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValkeyModule } from 'src/valkey/valkey.module';
import { ChattingController } from './chatting.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chatting, Chatmember]),
    ChatmemberModule,
    ChatblacklistModule,
    S3Module,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('ACCESS_TOKEN_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    ValkeyModule,
  ],
  controllers: [ChattingController],
  providers: [ChattingGateway, ChattingService, ChattingRepository],
  exports: [ChattingService, ChattingRepository],
})
export class ChattingModule {}
