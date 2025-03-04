import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Express } from 'express';
import { Readable } from 'stream';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('../user/guards/user-guard', () => ({
  UserGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('../user/guards/admin.guard', () => ({
  AdminGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

const mockEventService = {
  createEvent: jest.fn(),
  getAllEvents: jest.fn().mockResolvedValue([]),
  getActiveEvents: jest.fn().mockResolvedValue([]),
  getClosedEvents: jest.fn().mockResolvedValue([]),
  getEvent: jest.fn(),
  closeEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserService = {
  validateUser: jest.fn().mockResolvedValue(true),
  findById: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
  isAdmin: jest.fn().mockResolvedValue(true),
};

describe('EventController', () => {
  let controller: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        { provide: EventService, useValue: mockEventService },
        { provide: UserService, useValue: mockUserService },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  it('컨트롤러가 정의되어 있어야 합니다.', () => {
    expect(controller).toBeDefined();
  });

  describe('이벤트 생성 (createEvent)', () => {
    it('파일이 있는 경우 이벤트를 생성해야 합니다.', async () => {
      const createEventDto: CreateEventDto = {
        title: '새로운 이벤트',
        content: '이벤트 설명',
        expiration_at: new Date().toISOString(),
      };
      const file: Express.Multer.File = {
        originalname: 'test.png',
        buffer: Buffer.from('file'),
        fieldname: 'file',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        stream: Readable.from(Buffer.from('file')),
        destination: '',
        filename: 'test.png',
        path: '',
      };
      await controller.createEvent(createEventDto, file);
      expect(mockEventService.createEvent).toHaveBeenCalledWith(
        createEventDto,
        file,
      );
    });
  });

  describe('특정 이벤트 조회 (getEvent)', () => {
    it('이벤트가 존재하면 반환해야 합니다.', async () => {
      const event: Event = {
        id: 1,
        title: '테스트 이벤트',
        content: '이벤트 설명',
        image: 'test.jpg',
        created_at: new Date(),
        updated_at: new Date(),
        expiration_at: new Date().toISOString(),
        status: 'active',
      };
      mockEventService.getEvent.mockResolvedValue(event);
      const result = await controller.getEvent(1);
      expect(result).toEqual(event);
    });
  });

  describe('이벤트 수정 (updateEvent)', () => {
    it('이벤트를 수정해야 합니다.', async () => {
      const updateEventDto: UpdateEventDto = {
        title: '수정된 이벤트',
        expiration_at: new Date().toISOString(),
      };
      await controller.updateEvent(1, updateEventDto);
      expect(mockEventService.updateEvent).toHaveBeenCalledWith(
        1,
        updateEventDto,
      );
    });
  });

  describe('이벤트 삭제 (deleteEvent)', () => {
    it('이벤트를 삭제해야 합니다.', async () => {
      await controller.deleteEvent(1);
      expect(mockEventService.deleteEvent).toHaveBeenCalledWith(1);
    });
  });
});
