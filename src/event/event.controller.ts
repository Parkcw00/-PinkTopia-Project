import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventService } from './event.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @UseGuards(UserGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file')) // 파일 업로드 처리
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File, // 파일 받기
  ) {
    return this.eventService.createEvent(createEventDto, file);
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
  @UseGuards(UserGuard, AdminGuard)
  closeEvent(@Param('eventId') eventId: number) {
    return this.eventService.closeEvent(eventId);
  }

  /**
   * 이벤트 수정 API
   * [PATCH] /event/:eventId
   */
  @Patch(':eventId')
  @UseGuards(UserGuard, AdminGuard)
  updateEvent(
    @Param('eventId') eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventId, updateEventDto);
  }

  /** 이벤트 완전 삭제 (DB에서 삭제) */
  @Delete(':eventId')
  @UseGuards(UserGuard, AdminGuard)
  deleteEvent(@Param('eventId') eventId: number) {
    return this.eventService.deleteEvent(eventId);
  }
}
