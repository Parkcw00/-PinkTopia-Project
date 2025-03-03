import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChattingRepository } from './chatting.repository';
import { Chatting } from './entities/chatting.entity';
import { Chatmember } from '../chatmember/entities/chatmember.entity';
import { User } from '../user/entities/user.entity';

describe('ChattingRepository', () => {
  let repository: ChattingRepository;
  let mockChattingRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  } = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  let mockChatmemberRepo: {
    findOne: jest.Mock;
  } = {
    findOne: jest.fn(),
  };
  let mockUserRepo: Partial<Record<keyof Repository<User>, jest.Mock>>;

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingRepository,
        {
          provide: getRepositoryToken(Chatting),
          useValue: mockChattingRepo,
        },
        {
          provide: getRepositoryToken(Chatmember),
          useValue: mockChatmemberRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    repository = module.get<ChattingRepository>(ChattingRepository);
  });

  describe('create', () => {
    it('should create and save a new chat message', async () => {
      const mockUser = { id: 1 };
      const mockDto = { message: 'test' };
      const expectedResult = { id: 1, ...mockDto };

      mockChattingRepo.create.mockReturnValue(expectedResult);
      mockChattingRepo.save.mockResolvedValue(expectedResult);

      const result = await repository.create(mockUser, '1', mockDto as any);
      expect(result).toEqual(expectedResult);
      expect(mockChattingRepo.create).toBeCalledWith({
        user_id: 1,
        chatting_room_id: 1,
        ...mockDto,
      });
    });
  });

  describe('isMember', () => {
    it('should return true if user is a member', async () => {
      mockChatmemberRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await repository.isMember(1, '1');
      expect(result).toBe(true);
    });

    it('should return false if user is not a member', async () => {
      mockChatmemberRepo.findOne.mockResolvedValue(null);
      const result = await repository.isMember(1, '1');
      expect(result).toBe(false);
    });
  });
});
