import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';
import { S3Module } from '../s3/s3.module'; // S3 모듈 추가

@Module({
  imports: [TypeOrmModule.forFeature([Event]), S3Module],
  controllers: [EventController],
  providers: [EventService, EventRepository], //레포지토리 추가
  exports: [EventRepository],
})
export class EventModule {}
