import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChattingRepository } from './chatting.repository';
import { Chatting } from './entities/chatting.entity';
import { Chatmember } from '../chatmember/entities/chatmember.entity';
import { User } from '../user/entities/user.entity';

// ChattingRepository의 테스트 그룹 정의
describe('ChattingRepository', () => {
  let repository: ChattingRepository;

  // 가짜(Mock) 객체들 정의
  let mockChattingRepo = {
    create: jest.fn(), // 채팅 생성 메서드 모킹
    save: jest.fn(), // 채팅 저장 메서드 모킹
    find: jest.fn(), // 채팅 조회 메서드 모킹
  };
  let mockChatmemberRepo = {
    findOne: jest.fn(), // 채팅방 멤버 조회 메서드 모킹
  };
  let mockUserRepo = {
    findOne: jest.fn(), // 유저 조회 메서드 모킹
  };

  // 각 테스트 실행 전 초기 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingRepository,
        // TypeORM 리포지토리 대신 Mock 객체 주입
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

  // create 메서드 테스트 그룹
  describe('create', () => {
    it('채팅 생성 및 저장 성공 테스트', async () => {
      // Mock 데이터 설정
      const mockUser = { id: 1 };
      const mockDto = { message: 'test' };
      const expectedResult = { id: 1, ...mockDto };

      // Mock 메서드 동작 정의
      mockChattingRepo.create.mockReturnValue(expectedResult);
      mockChattingRepo.save.mockResolvedValue(expectedResult);

      // 메서드 실행 및 결과 검증
      const result = await repository.create(mockUser, '1', mockDto as any);
      expect(result).toEqual(expectedResult);
      expect(mockChattingRepo.create).toBeCalledWith({
        user_id: 1,
        chatting_room_id: 1,
        ...mockDto,
      });
    });
  });

  // isMember 메서드 테스트 그룹
  describe('isMember', () => {
    it('유저가 채팅방 멤버인 경우 true 반환', async () => {
      // Mock 메서드가 멤버 정보 반환하도록 설정
      mockChatmemberRepo.findOne.mockResolvedValue({ id: 1 });
      const result = await repository.isMember(1, '1');
      expect(result).toBe(true);
    });

    it('유저가 채팅방 멤버가 아닌 경우 false 반환', async () => {
      // Mock 메서드가 null 반환하도록 설정
      mockChatmemberRepo.findOne.mockResolvedValue(null);
      const result = await repository.isMember(1, '1');
      expect(result).toBe(false);
    });
  });
});
