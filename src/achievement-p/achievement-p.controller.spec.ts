import { Test, TestingModule } from '@nestjs/testing';
import { AchievementPController } from './achievement-p.controller';
import { AchievementPService } from './achievement-p.service';
import { AchievementP } from './entities/achievement-p.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { UserGuard } from '../user/guards/user-guard';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from '../valkey/valkey.service';

describe('AchievementPController', () => {
  let controller: AchievementPController;
  let service: jest.Mocked<AchievementPService>;

  // 각 테스트 케이스 실행 전 모듈 설정
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementPController],
      providers: [
        {
          provide: AchievementPService,
          useValue: {
            post: jest.fn(),
            deleteByUserNSub: jest.fn(),
            deleteByPId: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // 필요한 메서드 모킹
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }), // 필요한 메서드 모킹
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'), // 필요한 메서드 모킹
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-config-value'), // 필요한 메서드 모킹
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn().mockResolvedValue('mock-valkey-value'), // 필요한 메서드 모킹
          },
        },
      ],
    }).compile();

    controller = module.get<AchievementPController>(AchievementPController);
    service = module.get<AchievementPService>(
      AchievementPService,
    ) as jest.Mocked<AchievementPService>;
  });

  // 각 테스트 후 목업 초기화
  afterEach(() => {
    jest.clearAllMocks();
  });

  // post 메서드 테스트
  describe('post', () => {
    it('AchievementP를 생성해야 한다', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = 1;
      const mockAchievementP = {
        id: 1,
        user_id: 1,
        sub_achievement_id: subAchievementId,
      } as AchievementP;

      service.post.mockResolvedValue(mockAchievementP);

      const result = await controller.post(req, subAchievementId);

      expect(service.post).toHaveBeenCalledWith(req.user.id, subAchievementId);
      expect(result).toEqual(mockAchievementP);
    });
  });

  // deleteByUserNSub 메서드 테스트
  describe('deleteByUserNSub', () => {
    it('사용자와 서브 ID로 AchievementP를 삭제해야 한다', async () => {
      const req = { user: { id: 1 } };
      const subAchievementId = 1;
      const mockResponse = { message: '삭제 완료' };

      service.deleteByUserNSub.mockResolvedValue(mockResponse);

      const result = await controller.deleteByUserNSub(req, subAchievementId);

      expect(service.deleteByUserNSub).toHaveBeenCalledWith(
        req.user.id,
        subAchievementId,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // deleteByPId 메서드 테스트
  describe('deleteByPId', () => {
    it('ID로 AchievementP를 삭제해야 한다', async () => {
      const req = { user: { id: 1 } };
      const achievementPId = '1';
      const mockResponse = { message: '삭제 완료' };

      service.deleteByPId.mockResolvedValue(mockResponse);

      const result = await controller.deleteByPId(req, achievementPId);

      expect(service.deleteByPId).toHaveBeenCalledWith(achievementPId);
      expect(result).toEqual(mockResponse);
    });
  });
});
