import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from './achievement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Achievement } from '../achievement/entities/achievement.entity'; // 엔티티 확인!
import { Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service'; // S3Service 경로 확인 필요!
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementController } from './achievement.controller';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { AchievementRepository } from './achievement.repository';
import { User } from '../user/entities/user.entity';
import { ValkeyModule } from '../valkey/valkey.module';


describe('AchievementService', () => {
  let service: AchievementService;
  let achievementRepository: Repository<Achievement>;

  beforeEach(async () => {
    jest.clearAllMocks(); // Jest의 Mock 초기화
const mockAchievementRepository = {
  find: jest.fn(),
  save: jest.fn(),
};


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        {
          provide: getRepositoryToken(Achievement), // ✅ AchievementRepository가 아니라 Achievement 사용
          useValue: {
            find: jest.fn(), // find 함수 모킹
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue('mock-url'), // S3 업로드 함수 모킹
          },
        },  S3Service,
      ],
    }).compile();

    service = module.get<AchievementService>(AchievementService);
    achievementRepository = module.get<Repository<Achievement>>(getRepositoryToken(Achievement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
