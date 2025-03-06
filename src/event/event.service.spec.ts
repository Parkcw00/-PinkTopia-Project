import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { EventRepository } from './event.repository';
import { S3Service } from '../s3/s3.service';
import { NotFoundException } from '@nestjs/common';

// 이벤트 저장소(Mock)
const mockRepository = {
  createEvent: jest.fn(), // 이벤트 생성
  findAll: jest.fn().mockResolvedValue([]), // 전체 이벤트 조회
  findById: jest.fn(), // 특정 이벤트 조회
  updateEvent: jest.fn(), // 이벤트 업데이트
  deleteEvent: jest.fn(), // 이벤트 삭제
  findClosedEvents: jest.fn().mockResolvedValue([]), // 종료된 이벤트 조회
  findActiveEvents: jest.fn().mockResolvedValue([]), // 진행 중인 이벤트 조회
};

// S3 서비스(Mock)
const mockS3Service = {
  uploadFile: jest
    .fn()
    .mockResolvedValue('https://s3.amazonaws.com/mock-file-url'), // 파일 업로드
};

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: mockRepository },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('서비스가 정의되어 있어야 합니다.', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent (이벤트 생성)', () => {
    it('파일 없이 이벤트를 생성해야 합니다.', async () => {
      await service.createEvent({ title: '테스트 이벤트', content: '설명' });
      expect(mockRepository.createEvent).toHaveBeenCalledWith({
        title: '테스트 이벤트',
        content: '설명',
        image: undefined,
      });
    });

    it('파일과 함께 이벤트를 생성해야 합니다.', async () => {
      const file = {
        originalname: 'test.png',
        buffer: Buffer.from('file'),
      } as Express.Multer.File;
      await service.createEvent(
        { title: '테스트 이벤트', content: '설명' },
        file,
      );
      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(file);
      expect(mockRepository.createEvent).toHaveBeenCalledWith({
        title: '테스트 이벤트',
        content: '설명',
        image: 'https://s3.amazonaws.com/mock-file-url',
      });
    });
  });

  describe('getAllEvents (전체 이벤트 조회)', () => {
    it('모든 이벤트를 반환해야 합니다.', async () => {
      const result = await service.getAllEvents();
      expect(result).toEqual({
        message: '이벤트 전체 조회가 완료되었습니다.',
        events: [],
      });
    });
  });

  describe('getEvent (특정 이벤트 조회)', () => {
    it('이벤트가 존재할 경우 반환해야 합니다.', async () => {
      mockRepository.findById.mockResolvedValue({ id: 1, title: '이벤트' });
      const result = await service.getEvent(1);
      expect(result).toEqual({ id: 1, title: '이벤트' });
    });

    it('이벤트가 존재하지 않을 경우 NotFoundException을 발생시켜야 합니다.', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.getEvent(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteEvent (이벤트 삭제)', () => {
    it('이벤트가 존재할 경우 삭제해야 합니다.', async () => {
      mockRepository.findById.mockResolvedValue({ id: 1 });
      await service.deleteEvent(1);
      expect(mockRepository.deleteEvent).toHaveBeenCalledWith({ id: 1 });
    });

    it('이벤트가 존재하지 않을 경우 NotFoundException을 발생시켜야 합니다.', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.deleteEvent(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('closeEvent (이벤트 종료)', () => {
    it('이벤트 상태를 closed로 변경해야 합니다.', async () => {
      const event = { id: 1, status: 'active' };
      mockRepository.findById.mockResolvedValue(event);
      await service.closeEvent(1);
      expect(mockRepository.updateEvent).toHaveBeenCalledWith(event, {});
    });

    it('이벤트가 존재하지 않을 경우 NotFoundException을 발생시켜야 합니다.', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.closeEvent(1)).rejects.toThrow(NotFoundException);
    });
  });
});
