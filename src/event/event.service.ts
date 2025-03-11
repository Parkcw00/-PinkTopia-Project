import { Injectable, NotFoundException } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { S3Service } from '../s3/s3.service'; // S3Service 추가

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly s3Service: S3Service, // S3Service 주입
  ) {}

  /**
   * 이벤트 생성 (파일 업로드 포함)
   */
  async createEvent(
    createEventDto: CreateEventDto,
    file?: Express.Multer.File,
  ) {
    // expiration_at이 문자열로 들어올 경우 변환
    if (createEventDto.expiration_at) {
      createEventDto.expiration_at = new Date(
        createEventDto.expiration_at,
      ) as any;
    }

    // 파일이 존재하면 S3에 업로드하고 URL 저장
    let fileUrl: string | undefined = undefined; // ✅ null 대신 undefined 사용
    if (file) {
      fileUrl = await this.s3Service.uploadFile(file);
    }

    // 이벤트 데이터에 파일 URL 추가
    const eventData = {
      ...createEventDto,
      image: fileUrl, // 파일이 있을 경우 추가
    };

    await this.eventRepository.createEvent(eventData);
    return { message: '이벤트 생성이 완료되었습니다.', image: fileUrl };
  }

  /**
   * 전체 이벤트 조회
   */
  async getAllEvents() {
    const events = await this.eventRepository.findAll();
    return { message: '이벤트 전체 조회가 완료되었습니다.', events };
  }

  /**
   * 특정 이벤트 조회
   */
  async getEvent(eventId: number) {
    console.log(`🔍 이벤트 조회: ${eventId}`);
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      console.error('❌ 이벤트를 찾을 수 없음:', eventId);
      throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });
    }

    console.log('✅ 이벤트 조회 성공:', event);
    return event;
  }

  /**
   * 이벤트 수정 (파일 업로드 포함)
   */
  async updateEvent(
    eventId: number,
    updateEventDto: UpdateEventDto,
    file?: Express.Multer.File,
  ) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });
    }

    // expiration_at이 문자열이면 Date 타입으로 변환
    if (updateEventDto.expiration_at) {
      try {
        updateEventDto.expiration_at = new Date(
          updateEventDto.expiration_at,
        ) as any;
      } catch (error) {
        throw new Error('expiration_at 날짜 변환 오류');
      }
    }

    // 파일 업로드가 있을 경우 새로운 이미지 URL 설정
    let fileUrl: string | undefined = event.image; // 기존 이미지 유지
    if (file) {
      fileUrl = await this.s3Service.uploadFile(file);
    }

    // 기존 데이터 유지하면서 새로운 값 덮어쓰기
    Object.assign(event, updateEventDto, { image: fileUrl });

    console.log('🔄 업데이트할 이벤트 데이터:', event); // 로그 추가

    await this.eventRepository.updateEvent(event, updateEventDto);

    return { message: '이벤트 수정 성공', event };
  }

  /**
   * 이벤트 삭제
   */
  async deleteEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event)
      throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    await this.eventRepository.deleteEvent(event);
    return { message: '이벤트 삭제가 완료되었습니다.' };
  }

  /**
   * 종료된 이벤트 조회
   */
  async getClosedEvents() {
    const events = await this.eventRepository.findClosedEvents();
    return { message: '종료된 이벤트 조회 완료', events };
  }

  /**
   * 진행 중인 이벤트 조회
   */
  async getActiveEvents() {
    const events = await this.eventRepository.findActiveEvents();
    return { message: '진행 중인 이벤트 조회 완료', events };
  }

  /**
   * 이벤트 종료 (상태 변경)
   */
  async closeEvent(eventId: number) {
    const event = await this.eventRepository.findById(eventId);
    if (!event)
      throw new NotFoundException({ message: '이벤트가 존재하지 않습니다.' });

    event.status = 'closed';
    await this.eventRepository.updateEvent(event, {});
    return { message: '이벤트가 종료되었습니다.' };
  }
}
