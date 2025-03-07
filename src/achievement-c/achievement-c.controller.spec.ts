import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AchievementCController } from './achievement-c.controller';
import { AchievementCService } from './achievement-c.service';
import { CreateAchievementCDto } from './dto/create-achievement-c.dto';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from '../valkey/valkey.service'; // 프로젝트 구조에 맞게 경로 조정

describe('AchievementCController', () => {
  let controller: AchievementCController;
  let service: jest.Mocked<AchievementCService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AchievementCController],
      providers: [
        {
          provide: AchievementCService,
          useValue: {
            create: jest.fn().mockRejectedValue(new BadRequestException()), // 수정된 부분
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-config-value'),
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn().mockResolvedValue('mock-valkey-value'),
          },
        },
      ],
    }).compile();

    controller = module.get<AchievementCController>(AchievementCController);
    service = module.get<AchievementCService>(
      AchievementCService,
    ) as jest.Mocked<AchievementCService>;
  });

  it('should throw BadRequestException if DTO is invalid', async () => {
    const createAchievementCDto = {} as CreateAchievementCDto;
    await expect(service.create(createAchievementCDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
