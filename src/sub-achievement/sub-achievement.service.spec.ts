import { Test, TestingModule } from '@nestjs/testing';
import { SubAchievementService } from './sub-achievement.service';
import { SubAchievementRepository } from './sub-achievement.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubAchievement } from './entities/sub-achievement.entity';

describe('SubAchievementService', () => {
  let service: SubAchievementService;
  let repository: SubAchievementRepository;
  let s3Service: S3Service;
  let valkeyService: ValkeyService;

  beforeEach(async () => {
    // 테스트 모듈 생성 및 각 의존성에 대해 모의 객체를 주입합니다.
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubAchievementService,
        {
          provide: SubAchievementRepository,
          useValue: {
            getAll: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete_achievement_c: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFiles: jest.fn(),
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            // pipeline 메서드와 관련 기능을 모의 객체로 생성
            getClient: jest.fn().mockReturnValue({
              pipeline: jest.fn().mockReturnValue({
                set: jest.fn(),
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubAchievementService>(SubAchievementService);
    repository = module.get<SubAchievementRepository>(SubAchievementRepository);
    s3Service = module.get<S3Service>(S3Service);
    valkeyService = module.get<ValkeyService>(ValkeyService);
  });

  describe('fillValkey', () => {
    // DB에서 서브업적 데이터가 없을 경우 NotFoundException이 발생하는지 테스트
    it('DB에 서브업적 데이터가 없으면 NotFoundException을 던져야 합니다.', async () => {
      jest.spyOn(repository, 'getAll').mockResolvedValue([]);
      await expect(service.fillValkey()).rejects.toThrow(NotFoundException);
    });

    // DB에 서브업적 데이터가 있을 경우 Valkey에 데이터를 저장하고 성공 메시지를 반환하는지 테스트
    it('DB에 서브업적 데이터가 존재하면 Valkey에 데이터를 저장하고 성공 메시지를 반환해야 합니다.', async () => {
      const mockSubAchievements: SubAchievement[] = [
        { id: 1, title: '업적1' } as SubAchievement,
      ];
      jest.spyOn(repository, 'getAll').mockResolvedValue(mockSubAchievements);
      // pipeline 모의 객체 설정
      const pipeline = {
        set: jest.fn(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(valkeyService, 'getClient').mockReturnValue({ pipeline: () => pipeline }as any);
      const result = await service.fillValkey();
      expect(result).toEqual({
        message: `✅ ${mockSubAchievements.length}개의 서브업적이 Valkey에 저장되었습니다.`,
      });
      // pipeline의 set, exec 메서드 호출 여부 확인
      expect(pipeline.set).toHaveBeenCalled();
      expect(pipeline.exec).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    // 필수 데이터가 없을 경우 BadRequestException이 발생하는지 테스트
    it('필수 데이터가 없으면 BadRequestException을 던져야 합니다.', async () => {
      await expect(service.create({} as any, []))
        .rejects
        .toThrow(BadRequestException);
    });
    
    // 필요에 따라 파일 업로드 및 s3Service 호출 등 추가 테스트를 작성할 수 있습니다.
  });

  describe('findOne', () => {
    // id 형식이 올바르지 않은 경우 예외 발생 여부 테스트
    it('잘못된 id가 주어지면 BadRequestException을 던져야 합니다.', async () => {
      await expect(service.findOne('abc')).rejects.toThrow(BadRequestException);
    });
    // id로 조회했을 때 데이터가 없으면 NotFoundException 발생 테스트
    it('존재하지 않는 업적이면 NotFoundException을 던져야 합니다.', async () => {
      jest.spyOn(valkeyService, 'get').mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    // 잘못된 id 형식일 때 예외 발생 여부 테스트
    it('잘못된 id가 주어지면 BadRequestException을 던져야 합니다.', async () => {
      await expect(service.update('abc', {})).rejects.toThrow(BadRequestException);
    });
    // 업데이트 후 데이터 동기화 등의 추가 테스트 케이스를 작성할 수 있습니다.
  });

  describe('softDelete', () => {
    // 잘못된 id 형식일 때 예외 발생 여부 테스트
    it('잘못된 id가 주어지면 BadRequestException을 던져야 합니다.', async () => {
      await expect(service.softDelete('abc')).rejects.toThrow(BadRequestException);
    });
    // 데이터가 존재하지 않을 경우 NotFoundException 발생 여부 테스트
    it('존재하지 않는 업적이면 NotFoundException을 던져야 합니다.', async () => {
      jest.spyOn(valkeyService, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.softDelete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
