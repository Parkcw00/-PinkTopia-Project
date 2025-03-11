import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  /**
   * 특정 이벤트 조회
   */
  async findById(eventId: number): Promise<Event | null> {
    console.log(`🛠️ 이벤트 ID 검색: ${eventId}`);
    return this.repository.findOne({ where: { id: Number(eventId) } });
  }

  /**
   * 모든 이벤트 조회
   */
  async findAll(): Promise<Event[]> {
    return this.repository.find();
  }

  /**
   * 종료된 이벤트 조회
   */
  async findClosedEvents(): Promise<Event[]> {
    return this.repository.find({ where: { status: 'closed' } });
  }

  /**
   * 진행 중인 이벤트 조회
   */
  async findActiveEvents(): Promise<Event[]> {
    return this.repository.find({ where: { status: 'active' } });
  }

  /**
   * 이벤트 생성
   */
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.repository.create(createEventDto);
    return this.repository.save(event);
  }

  /**
   * 이벤트 업데이트
   */
  async updateEvent(
    event: Event,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    Object.assign(event, updateEventDto);
    console.log('🔹 업데이트된 이벤트 데이터:', event); // 디버깅용 로그 추가
    return this.repository.save(event);
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(event: Event): Promise<void> {
    await this.repository.remove(event);
  }
}
