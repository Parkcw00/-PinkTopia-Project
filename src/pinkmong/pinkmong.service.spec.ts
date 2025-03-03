import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongService } from './pinkmong.service';
import { PinkmongRepository } from './pinkmong.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';
import { Pinkmong } from './entities/pinkmong.entity';

describe('PinkmongService', () => {
  let pinkmongService: PinkmongService;
  let pinkmongRepository: jest.Mocked<PinkmongRepository>;
  let s3Service: jest.Mocked<S3Service>;
  let valkeyService: jest.Mocked<ValkeyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinkmongService,
        {
          provide: PinkmongRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            createPinkmong: jest.fn(),
            updatePinkmong: jest.fn(),
            deletePinkmong: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: ValkeyService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    pinkmongService = module.get<PinkmongService>(PinkmongService);
    pinkmongRepository = module.get(PinkmongRepository);
    s3Service = module.get(S3Service);
    valkeyService = module.get(ValkeyService);
  });

  it('should be defined', () => {
    expect(pinkmongService).toBeDefined();
  });

  // 1️⃣ **핑크몽 전체 조회**
  describe('getAllPinkmongs', () => {
    it('should return cached pinkmongs if found in Valkey', async () => {
      const cachedPinkmongs: Pinkmong[] = [
        {
          id: 1,
          name: '핑크몽',
          pinkmong_image: 'https://s3.example.com/image.png',
          explain: '핑크몽 설명',
          region_theme: 'forest',
          grade: 'epic',
          point: 100,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: undefined,
          catch_pinkmong: [],
          collection: [],
        },
      ];
      valkeyService.get.mockResolvedValue(cachedPinkmongs);

      const result = await pinkmongService.getAllPinkmongs();

      expect(result).toEqual({
        message: '핑크몽 전체 조회 성공',
        pinkmongs: cachedPinkmongs,
      });
      expect(pinkmongRepository.findAll).not.toHaveBeenCalled();
    });

    it('should return pinkmongs from DB if not found in Valkey', async () => {
      const dbPinkmongs: Pinkmong[] = [
        {
          id: 1,
          name: '핑크몽',
          pinkmong_image: 'https://s3.example.com/image.png',
          explain: '핑크몽 설명',
          region_theme: 'forest',
          grade: 'epic',
          point: 100,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: undefined,
          catch_pinkmong: [],
          collection: [],
        },
      ];
      valkeyService.get.mockResolvedValue(null);
      pinkmongRepository.findAll.mockResolvedValue(dbPinkmongs);

      const result = await pinkmongService.getAllPinkmongs();

      expect(result).toEqual({
        message: '핑크몽 전체 조회 성공',
        pinkmongs: dbPinkmongs,
      });
      expect(valkeyService.set).toHaveBeenCalledWith(
        'pinkmong:all',
        dbPinkmongs,
        6000,
      );
    });
  });

  // 2️⃣ **특정 핑크몽 조회**
  describe('getPinkmong', () => {
    it('should return cached pinkmong if found in Valkey', async () => {
      const pinkmong: Pinkmong = {
        id: 1,
        name: '핑크몽',
        pinkmong_image: 'https://s3.example.com/image.png',
        explain: '핑크몽 설명',
        region_theme: 'forest',
        grade: 'epic',
        point: 100,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };
      valkeyService.get.mockResolvedValue(pinkmong);

      const result = await pinkmongService.getPinkmong(1);

      expect(result).toEqual(pinkmong);
      expect(pinkmongRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if pinkmong does not exist', async () => {
      valkeyService.get.mockResolvedValue(null);
      pinkmongRepository.findById.mockResolvedValue(null);

      await expect(pinkmongService.getPinkmong(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // 3️⃣ **핑크몽 생성**
  describe('createPinkmong', () => {
    it('should create a pinkmong', async () => {
      const createPinkmongDto: CreatePinkmongDto = {
        name: '새 핑크몽',
        explain: '설명',
        region_theme: 'forest',
        grade: 'epic',
        point: 100,
      };
      const file = { buffer: Buffer.from('file data') } as Express.Multer.File;
      const uploadedUrl = 'https://s3.example.com/pinkmong.png';

      s3Service.uploadFile.mockResolvedValue(uploadedUrl);
      pinkmongRepository.createPinkmong.mockResolvedValue({
        id: 1,
        name: createPinkmongDto.name,
        pinkmong_image: uploadedUrl,
        explain: createPinkmongDto.explain,
        region_theme: createPinkmongDto.region_theme,
        grade: createPinkmongDto.grade,
        point: createPinkmongDto.point,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined, // ✅ undefined로 변경
        catch_pinkmong: [],
        collection: [],
      });

      const result = await pinkmongService.createPinkmong(
        createPinkmongDto,
        file,
      );

      expect(result).toEqual({
        id: 1,
        name: createPinkmongDto.name,
        pinkmong_image: uploadedUrl,
        explain: createPinkmongDto.explain,
        region_theme: createPinkmongDto.region_theme,
        grade: createPinkmongDto.grade,
        point: createPinkmongDto.point,
        created_at: expect.any(Date), // ✅ Date 타입이면 통과
        updated_at: expect.any(Date), // ✅ Date 타입이면 통과
        deleted_at: undefined,
        catch_pinkmong: expect.any(Array), // ✅ 배열 검증
        collection: expect.any(Array),
      });
      expect(s3Service.uploadFile).toHaveBeenCalledWith(file);
    });
  });

  // 4️⃣ **핑크몽 삭제**
  describe('deletePinkmong', () => {
    it('should delete a pinkmong', async () => {
      const pinkmong: Pinkmong = {
        id: 1,
        name: '핑크몽',
        pinkmong_image: 'https://s3.example.com/image.png',
        explain: '핑크몽 설명',
        region_theme: 'forest',
        grade: 'epic',
        point: 100,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };
      pinkmongRepository.findById.mockResolvedValue(pinkmong);

      const result = await pinkmongService.deletePinkmong(1);

      expect(result).toEqual({ message: '핑크몽 삭제가 완료 되었습니다.' });
    });

    it('should throw NotFoundException if pinkmong does not exist', async () => {
      pinkmongRepository.findById.mockResolvedValue(null);

      await expect(pinkmongService.deletePinkmong(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
