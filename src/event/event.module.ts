import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventRepository } from './event.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventController],
  providers: [EventService, EventRepository], //레포지토리 추가
  exports: [EventRepository],
})
export class EventModule {}
