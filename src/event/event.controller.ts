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
  createEvent(@Body() body: { title: string; content: string; image?: string, expiration_at?: string }) {
    return this.eventService.createEvent(body.title, body.content, body.image, body.expiration_at);
  }


/** 모든 이벤트 조회 (진행 중 + 종료된 이벤트) */
@Get('events')
getAllEvents() {
  return this.eventService.getAllEvents();
}


/** 진행 중인 이벤트 조회 */
@Get('active')
getActiveEvents() {
  return this.eventService.getActiveEvents();
}

/** 종료된 이벤트 조회 */
@Get('closed')
getClosedEvents() {
  return this.eventService.getClosedEvents();
}

  /**
   * 특정 이벤트 조회 API
   * [GET] /event/:eventId
   */
  @Get(':eventId')
  getEvent(@Param('eventId') eventId: number) {
    return this.eventService.getEvent(eventId);
  }

/** 이벤트 종료 */
@Patch('close/:eventId')
closeEvent(@Param('eventId') eventId: number) {
  return this.eventService.closeEvent(eventId);
}

  /**
   * 이벤트 수정 API
   * [PATCH] /event/:eventId
   */
  @Patch(':eventId')
  updateEvent(
    @Param('eventId') eventId: number,
    @Body() body: { title?: string; content?: string; image?: string; expiration_at?: string },
  ) {
    // console.log(`📢 컨트롤러 요청: eventId=${eventId}, expiration_at=${body.expiration_at}`);
  
    return this.eventService.updateEvent(
      eventId, 
      body.title, 
      body.content, 
      body.image, 
      body.expiration_at  // ✅ expiration_at 전달 추가
    );
  }

/** 이벤트 완전 삭제 (DB에서 삭제) */
@Delete(':eventId')
deleteEvent(@Param('eventId') eventId: number) {
  return this.eventService.deleteEvent(eventId);
}
}
