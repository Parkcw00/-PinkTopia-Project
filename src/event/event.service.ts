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


 /** 전체 이벤트 조회 (진행 중 + 종료된 이벤트 포함) */
 async getAllEvents() {
  // console.log('📢 getAllEvents() 실행됨');

  try {
    const events = await this.eventRepository.find({
      withDeleted: true, // 소프트 삭제된 데이터 포함
    });
    // console.log('🔍 조회된 이벤트:', events);
    if (!events || events.length === 0) {
      return { message: '조회할 이벤트가 없습니다.', events: [] };
    }
    return { message: '이벤트 전체 조회가 완료되었습니다.', events };
  } catch (error) {
    // console.error('❌ 전체 조회 중 오류 발생:', error);
    throw new Error('이벤트 전체 조회 중 오류가 발생했습니다.');
  }
}


/** 종료된 이벤트만 조회 */
async getClosedEvents() {
  // console.log('📢 getClosedEvents() 실행됨');

  try {
    const events = await this.eventRepository.find({
      where: { status: 'closed' }, // 'closed' 상태인 이벤트만 가져오기
    });

    // console.log('🔍 종료된 이벤트:', events);

    if (!events || events.length === 0) {
      return { message: '종료된 이벤트가 없습니다.', events: [] };
    }

    return { message: '종료된 이벤트 조회 완료', events };
  } catch (error) {
    // console.error('❌ 종료된 이벤트 조회 중 오류 발생:', error);
    throw new Error('종료된 이벤트 조회 중 오류가 발생했습니다.');
  }
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


/** 진행 중인 이벤트만 조회 */
async getActiveEvents() {
  const events = await this.eventRepository.find({ where: { status: 'active' } });
  return { message: '진행 중인 이벤트 조회 완료', events };
}


/** 이벤트 종료 (삭제 대신 상태 변경) */
async closeEvent(eventId: number) {
  const event = await this.eventRepository.findOne({ where: { id: eventId } });
  if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

  // 이벤트를 'closed' 상태로 변경
  event.status = 'closed';
  await this.eventRepository.save(event);

  return { message: '이벤트가 종료되었습니다.' };
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

 /** 이벤트 완전 삭제 (DB에서 삭제) */
 async deleteEvent(eventId: number) {
  const event = await this.eventRepository.findOne({ where: { id: eventId } });
  if (!event) throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

  // DB에서 완전 삭제
  await this.eventRepository.remove(event);

  return { message: '이벤트가 완전히 삭제되었습니다.' };
}
}
