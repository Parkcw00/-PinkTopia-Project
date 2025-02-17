import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { Event } from './entities/event.entity';

/**
 * EventService
 * 
 * 이벤트의 생성, 조회, 수정, 삭제 등의 비즈니스 로직을 처리하는 서비스 클래스
 */
@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository, // 레포지토리 주입
  ) {}

  /**
   * 전체 이벤트 조회
   * 
   * returns 데이터베이스에 저장된 모든 이벤트 목록을 반환
   */
  async getAllEvents(): Promise<{ message: string; events: Event[] }> {
    const events = await this.eventRepository.findAll();
    return { message: '이벤트 전체 조회 완료', events };
  }

  /**
   * 특정 이벤트 조회
   * 
   * param eventId - 조회할 이벤트의 ID
   * returns 해당 이벤트 정보 반환
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async getEvent(eventId: number): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });
    return event;
  }

  /**
   * 이벤트 생성
   * 
   * param title - 이벤트 제목
   * param content - 이벤트 내용
   * param image - 이벤트 이미지 URL (선택 사항)
   * param expiration_at - 이벤트 만료 날짜 (선택 사항)
   * returns 생성 완료 메시지 반환
   */
  async createEvent(title: string, content: string, image?: string, expiration_at?: string): Promise<{ message: string }> {
    await this.eventRepository.createEvent({ title, content, image, expiration_at });
    return { message: '이벤트 생성 완료' };
  }

  /**
   * 이벤트 수정
   * 
   * param eventId - 수정할 이벤트의 ID
   * param title - 새로운 제목 (선택 사항)
   * param content - 새로운 내용 (선택 사항)
   * param image - 새로운 이미지 URL (선택 사항)
   * param expiration_at - 새로운 만료 날짜 (선택 사항)
   * returns 수정 완료 메시지 및 수정된 이벤트 정보 반환
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async updateEvent(eventId: number, title?: string, content?: string, image?: string, expiration_at?: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    event.title = title ?? event.title;
    event.content = content ?? event.content;
    event.image = image ?? event.image;

    if (expiration_at !== undefined) {
      event.expiration_at = expiration_at;
    }

    await this.eventRepository.updateEvent(event);
    return { message: '이벤트 수정 성공', event };
  }

  /**
   * 이벤트 삭제
   * 
   * param eventId - 삭제할 이벤트의 ID
   * returns 삭제 완료 메시지 반환
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async deleteEvent(eventId: number): Promise<{ message: string }> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    await this.eventRepository.deleteEvent(event);
    return { message: '이벤트 삭제 완료' };
  }

  /**
   * 종료된 이벤트 조회
   * 
   * returns 상태가 'closed'인 이벤트 목록 반환
   */
  async getClosedEvents(): Promise<{ message: string; events: Event[] }> {
    const events = await this.eventRepository.findClosedEvents();
    return { message: '종료된 이벤트 조회 완료', events };
  }

  /**
   * 진행 중인 이벤트 조회
   * 
   * returns 상태가 'active'인 이벤트 목록 반환
   */
  async getActiveEvents(): Promise<{ message: string; events: Event[] }> {
    const events = await this.eventRepository.findActiveEvents();
    return { message: '진행 중인 이벤트 조회 완료', events };
  }

  /**
   * 이벤트 종료 (상태 변경)
   * 
   * param eventId - 종료할 이벤트의 ID
   * returns 종료 완료 메시지 반환
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async closeEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    event.status = 'closed';
    await this.eventRepository.updateEvent(event);

    return { message: '이벤트가 종료되었습니다.' };
  }
}
