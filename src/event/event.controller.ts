import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { EventService } from './event.service';

/**
 * EventController
 * 
 * 이벤트 관련 API 엔드포인트를 관리하는 컨트롤러
 */
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * 이벤트 생성 API
   * [POST] /event
   */
  @Post()
  createEvent(@Body() body: { title: string; content: string; image?: string }) {
    return this.eventService.createEvent(body.title, body.content, body.image);
  }

  /**
   * 특정 이벤트 조회 API
   * [GET] /event/:eventId
   */
  @Get(':eventId')
  getEvent(@Param('eventId') eventId: number) {
    return this.eventService.getEvent(eventId);
  }

  /**
   * 모든 이벤트 조회 API
   * [GET] /event/events
   */
  @Get('events')
  getAllEvents() {
    return this.eventService.getAllEvents();
  }

  /**
   * 이벤트 수정 API
   * [PATCH] /event/:eventId
   */
  @Patch(':eventId')
  updateEvent(
    @Param('eventId') eventId: number,
    @Body() body: { title?: string; content?: string; image?: string },
  ) {
    return this.eventService.updateEvent(eventId, body.title, body.content, body.image);
  }

  /**
   * 이벤트 삭제 API
   * [DELETE] /event/:eventId
   */
  @Delete(':eventId')
  deleteEvent(@Param('eventId') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }
}
