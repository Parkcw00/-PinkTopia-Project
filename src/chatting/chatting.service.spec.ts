import { Test, TestingModule } from '@nestjs/testing';
import { ChattingService } from './chatting.service';
import { ChattingRepository } from './chatting.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

// ChattingService의 테스트 그룹 정의
describe('ChattingService', () => {
  let service: ChattingService;

  // Mock 객체들 정의
  let mockRepository = {
    isMember: jest.fn().mockResolvedValue(true), // 멤버 여부 확인 모킹
    create: jest.fn(), // 채팅 생성 모킹
    findAll: jest.fn().mockResolvedValue([]), // 전체 조회 모킹
    getUserNickname: jest.fn().mockResolvedValue({ nickname: 'testUser' }), // 닉네임 조회 모킹
  };
  let mockS3Service = {
    uploadFile: jest.fn().mockResolvedValue('http://example.com/image.jpg'), // S3 업로드 모킹
  };
  let mockValkeyService = {
    llen: jest.fn(), // Redis 리스트 길이 조회 모킹
    lpop: jest.fn(), // Redis 리스트 왼쪽 제거 모킹
    rpush: jest.fn(), // Redis 리스트 오른쪽 추가 모킹
    lrange: jest.fn().mockResolvedValue([]), // Redis 리스트 범위 조회 모킹
  };

  // 각 테스트 실행 전 초기 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingService,
        // 의존성 주입 설정
        { provide: ChattingRepository, useValue: mockRepository },
        { provide: S3Service, useValue: mockS3Service },
        { provide: ValkeyService, useValue: mockValkeyService },
      ],
    }).compile();

    service = module.get<ChattingService>(ChattingService);
  });

  // create 메서드 테스트 그룹
  describe('create', () => {
    it('권한 없는 유저가 채팅 생성 시도 시 예외 발생', async () => {
      // 멤버가 아니라고 설정
      mockRepository.isMember.mockResolvedValueOnce(false);
      await expect(
        service.create({ id: 1 }, '1', { message: 'test' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Redis 메시지 5개 초과 시 오래된 메시지 DB 저장', async () => {
      // Redis 메시지 개수를 6으로 설정
      mockValkeyService.llen.mockResolvedValue(6);
      mockValkeyService.lpop.mockResolvedValue(
        JSON.stringify({ message: 'old' }),
      );

      await service.create({ id: 1 }, '1', { message: 'new' } as any);

      // Redis에서 메시지 제거 및 DB 저장 호출 검증
      expect(mockValkeyService.lpop).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  // uploadFile 메서드 테스트 그룹
  describe('uploadFile', () => {
    it('이미지가 아닌 파일 업로드 시 예외 발생', async () => {
      // 텍스트 파일로 설정
      const mockFile = { mimetype: 'text/plain' } as Express.Multer.File;
      await expect(
        service.uploadFile({ id: 1 }, '1', mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // findAll 메서드 테스트 그룹
  describe('findAll', () => {
    it('DB와 Redis 메시지 통합 반환', async () => {
      // Mock 데이터 설정
      mockRepository.findAll.mockResolvedValue([
        { message: 'db', nickname: 'user1' },
      ]);
      mockValkeyService.lrange.mockResolvedValue([
        JSON.stringify({ user_id: 1, message: 'redis' }),
      ]);

      const result = await service.findAll({ id: 1 }, '1');
      expect(result).toHaveLength(2); // DB 1개 + Redis 1개
      expect(result[0]).toHaveProperty('nickname'); // 닉네임 포함 여부 확인
    });
  });
});
