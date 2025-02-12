import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

/**
 * EventService
 * 
 * 이벤트의 생성, 조회, 수정, 삭제 등의 비즈니스 로직을 처리하는 서비스 클래스
 */
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * 이벤트 생성
   * 
   * @ param title - 이벤트 제목
   * @ param content - 이벤트 내용
   * @ param image - 이벤트 이미지 URL (선택 사항)
   * @ returns 생성 완료 메시지
   */
  async createEvent(title: string, content: string, image?: string) {
    const event = this.eventRepository.create({ title, content, image });
    await this.eventRepository.save(event);
    return { message: '이벤트 생성이 완료 되었습니다.' };
  }

  /**
   * 특정 이벤트 조회
   * 
   * param eventId - 조회할 이벤트의 ID
   * returns 해당 이벤트 정보
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async getEvent(eventId: number) {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });
    return event;
  }

  /**
   * 전체 이벤트 조회
   * 
   * returns 모든 이벤트 목록
   */
  async getAllEvents() {
    const events = await this.eventRepository.find();
    return { message: '이벤트 전체 조회가 완료 되었습니다.', events };
  }

  /**
   * 이벤트 수정
   * 
   * param eventId - 수정할 이벤트의 ID
   * param title - 새로운 제목 (선택 사항)
   * param content - 새로운 내용 (선택 사항)
   * param image - 새로운 이미지 URL (선택 사항)
   * returns 수정 완료 메시지
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async updateEvent(eventId: number, title?: string, content?: string, image?: string) {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    event.title = title ?? event.title;
    event.content = content ?? event.content;
    event.image = image ?? event.image;

    await this.eventRepository.save(event);
    return { message: '이벤트 수정 성공' };
  }

  /**
   * 이벤트 삭제 (소프트 삭제)
   * 
   * param eventId - 삭제할 이벤트의 ID
   * returns 삭제 완료 메시지
   * throws NotFoundException - 이벤트가 존재하지 않을 경우 예외 발생
   */
  async deleteEvent(eventId: number) {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    await this.eventRepository.softRemove(event);
    return { message: '이벤트 삭제가 완료 되었습니다.' };
  }
}
