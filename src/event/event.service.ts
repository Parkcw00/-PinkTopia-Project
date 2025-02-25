import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

/**
 * EventService
 * 
 * 이벤트의 생성, 조회, 수정, 삭제 등의 비즈니스 로직을 처리하는 서비스 클래스
 */
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
  ) {}

  /**
   * 이벤트 생성
   * 
   * @param createEventDto - 이벤트 생성 DTO
   * @returns 생성 완료 메시지 반환
   */
  async createEvent(createEventDto: CreateEventDto) {
    // expiration_at이 문자열로 들어올 경우 변환
    if (createEventDto.expiration_at) {
      createEventDto.expiration_at = new Date(createEventDto.expiration_at) as any;
    }

    await this.eventRepository.createEvent(createEventDto);
    return { message: '이벤트 생성이 완료되었습니다.' };
  }

  /**
   * 전체 이벤트 조회
   * 
   * @returns 데이터베이스에 저장된 모든 이벤트 목록 반환
   */
  async getAllEvents() {
    const events = await this.eventRepository.findAll();
    return { message: '이벤트 전체 조회가 완료되었습니다.', events };
  }

  /**
   * 특정 이벤트 조회
   * 
   * @param eventId - 조회할 이벤트의 ID
   * @returns 해당 이벤트 정보 반환
   */
  async getEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });
    return event;
  }

  /**
   * 이벤트 수정
   * 
   * @param eventId - 수정할 이벤트의 ID
   * @param updateEventDto - 수정할 데이터
   * @returns 수정 완료 메시지 반환
   */
  async updateEvent(eventId: number, updateEventDto: UpdateEventDto) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    // expiration_at이 문자열로 들어올 경우 변환
    if (updateEventDto.expiration_at) {
      updateEventDto.expiration_at = new Date(updateEventDto.expiration_at) as any;
    }

    await this.eventRepository.updateEvent(event, updateEventDto);
    return { message: '이벤트 수정 성공', event };
  }

  /**
   * 이벤트 삭제
   * 
   * @param eventId - 삭제할 이벤트의 ID
   * @returns 삭제 완료 메시지 반환
   */
  async deleteEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    await this.eventRepository.deleteEvent(event);
    return { message: '이벤트 삭제가 완료되었습니다.' };
  }

  /**
   * 종료된 이벤트 조회
   * 
   * @returns 상태가 'closed'인 이벤트 목록 반환
   */
  async getClosedEvents() {
    const events = await this.eventRepository.findClosedEvents();
    return { message: '종료된 이벤트 조회 완료', events };
  }

  /**
   * 진행 중인 이벤트 조회
   * 
   * @returns 상태가 'active'인 이벤트 목록 반환
   */
  async getActiveEvents() {
    const events = await this.eventRepository.findActiveEvents();
    return { message: '진행 중인 이벤트 조회 완료', events };
  }

  /**
   * 이벤트 종료 (상태 변경)
   * 
   * @param eventId - 종료할 이벤트의 ID
   * @returns 종료 완료 메시지 반환
   */
  async closeEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    event.status = 'closed';
    await this.eventRepository.updateEvent(event, {});
    return { message: '이벤트가 종료되었습니다.' };
  }
}
