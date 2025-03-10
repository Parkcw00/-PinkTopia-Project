import { Test, TestingModule } from '@nestjs/testing';
import { EventRepository } from './event.repository';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockRepository = {
  findOne: jest.fn(), // 특정 이벤트 조회
  find: jest.fn(), // 이벤트 목록 조회
  create: jest.fn(), // 이벤트 생성
  save: jest.fn(), // 이벤트 저장
  remove: jest.fn(), // 이벤트 삭제
};

describe('EventRepository', () => {
  let repository: EventRepository;
  let eventRepo: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        { provide: getRepositoryToken(Event), useValue: mockRepository },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    eventRepo = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('레포지토리가 정의되어 있어야 합니다.', () => {
    expect(repository).toBeDefined();
  });

  describe('findById (특정 이벤트 조회)', () => {
    it('이벤트가 존재하면 반환해야 합니다.', async () => {
      const event: Event = {
        id: 1,
        title: '테스트 이벤트',
        content: '',
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active',
      };
      mockRepository.findOne.mockResolvedValue(event);
      const result = await repository.findById(1);
      expect(result).toEqual(event);
    });

    it('이벤트가 존재하지 않으면 null을 반환해야 합니다.', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await repository.findById(1);
      expect(result).toBeNull();
    });
  });

  describe('findAll (전체 이벤트 조회)', () => {
    it('모든 이벤트를 반환해야 합니다.', async () => {
      const events: Event[] = [
        {
          id: 1,
          title: '이벤트 1',
          content: '',
          created_at: new Date(),
          updated_at: new Date(),
          status: 'active',
        },
      ];
      mockRepository.find.mockResolvedValue(events);
      const result = await repository.findAll();
      expect(result).toEqual(events);
    });
  });

  describe('deleteEvent (이벤트 삭제)', () => {
    it('이벤트를 삭제해야 합니다.', async () => {
      const event: Event = {
        id: 1,
        title: '삭제할 이벤트',
        content: '',
        created_at: new Date(),
        updated_at: new Date(),
        status: 'active',
      };
      await repository.deleteEvent(event);
      expect(mockRepository.remove).toHaveBeenCalledWith(event);
    });
  });
});
