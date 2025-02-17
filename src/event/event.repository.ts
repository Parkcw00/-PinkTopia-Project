import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * EventRepository
 * 
 * 이벤트 데이터를 데이터베이스에서 조회, 생성, 수정, 삭제하는 역할을 담당하는 클래스
 */
@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  /**
   * 특정 이벤트 조회
   * 
   * param eventId - 조회할 이벤트의 ID
   * returns 해당 ID의 이벤트 정보를 반환하거나, 존재하지 않을 경우 null 반환
   */
  async findById(eventId: number): Promise<Event | null> {
    return this.repository.findOne({ where: { id: eventId } });
  }

  /**
   * 모든 이벤트 조회 (소프트 삭제된 데이터 포함)
   * 
   * returns 데이터베이스에 저장된 모든 이벤트 목록 반환
   */
  async findAll(): Promise<Event[]> {
    return this.repository.find({ withDeleted: true });
  }

  /**
   * 종료된 이벤트 조회
   * 
   * returns 상태가 'closed'인 이벤트 목록 반환
   */
  async findClosedEvents(): Promise<Event[]> {
    return this.repository.find({ where: { status: 'closed' } });
  }

  /**
   * 진행 중인 이벤트 조회
   * 
   * returns 상태가 'active'인 이벤트 목록 반환
   */
  async findActiveEvents(): Promise<Event[]> {
    return this.repository.find({ where: { status: 'active' } });
  }

  /**
   * 이벤트 생성
   * 
   * param eventData - 생성할 이벤트의 데이터
   * returns 생성된 이벤트 정보 반환
   */
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const event = this.repository.create(eventData);
    return this.repository.save(event);
  }

  /**
   * 이벤트 업데이트
   * 
   * param event - 수정할 이벤트 객체
   * returns 수정된 이벤트 정보 반환
   */
  async updateEvent(event: Event): Promise<Event> {
    return this.repository.save(event);
  }

  /**
   * 이벤트 삭제
   * 
   * param event - 삭제할 이벤트 객체
   */
  async deleteEvent(event: Event): Promise<void> {
    await this.repository.remove(event);
  }
}
