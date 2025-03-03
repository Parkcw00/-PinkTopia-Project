import { Test, TestingModule } from '@nestjs/testing';
import { ChattingService } from './chatting.service';
import { ChattingRepository } from './chatting.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ChattingService', () => {
  let service: ChattingService;
  let mockRepository: {
    isMember: jest.Mock;
    create: jest.Mock;
    findAll: jest.Mock;
    getUserNickname: jest.Mock;
  } = {
    isMember: jest.fn().mockResolvedValue(true),
    create: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    getUserNickname: jest.fn().mockResolvedValue({ nickname: 'testUser' }),
  };
  let mockS3Service: Partial<S3Service>;
  let mockValkeyService: {
    llen: jest.Mock;
    lpop: jest.Mock;
    rpush: jest.Mock;
    lrange: jest.Mock;
  } = {
    llen: jest.fn(),
    lpop: jest.fn(),
    rpush: jest.fn(),
    lrange: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockS3Service = {
      uploadFile: jest.fn().mockResolvedValue('http://example.com/image.jpg'),
    };

    mockValkeyService = {
      llen: jest.fn(),
      lpop: jest.fn(),
      rpush: jest.fn(),
      lrange: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChattingService,
        { provide: ChattingRepository, useValue: mockRepository },
        { provide: S3Service, useValue: mockS3Service },
        { provide: ValkeyService, useValue: mockValkeyService },
      ],
    }).compile();

    service = module.get<ChattingService>(ChattingService);
  });

  describe('create', () => {
    it('should throw ForbiddenException if not a member', async () => {
      mockRepository.isMember.mockResolvedValueOnce(false);
      await expect(
        service.create({ id: 1 }, '1', { message: 'test' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should migrate old messages when exceeding limit', async () => {
      mockValkeyService.llen.mockResolvedValue(6);
      mockValkeyService.lpop.mockResolvedValue(
        JSON.stringify({ message: 'old' }),
      );

      await service.create({ id: 1 }, '1', { message: 'new' } as any);

      expect(mockValkeyService.lpop).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('should reject non-image files', async () => {
      const mockFile = { mimetype: 'text/plain' } as Express.Multer.File;
      await expect(
        service.uploadFile({ id: 1 }, '1', mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should combine DB and Redis messages', async () => {
      mockRepository.findAll.mockResolvedValue([
        { message: 'db', nickname: 'user1' },
      ]);
      mockValkeyService.lrange.mockResolvedValue([
        JSON.stringify({ user_id: 1, message: 'redis' }),
      ]);

      const result = await service.findAll({ id: 1 }, '1');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('nickname');
    });
  });
});
