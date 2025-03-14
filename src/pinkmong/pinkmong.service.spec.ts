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

  // **핑크몽 전체 조회**
  describe('getAllPinkmongs(전체 핑크몽 조회)', () => {
    it('Valkey 캐시에 데이터가 있는 경우, 캐시된 데이터를 반환해야 한다.', async () => {
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

    it('Valkey 캐시에 데이터가 없는 경우, DB에서 조회 후 캐시에 저장해야 한다.', async () => {
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

  // **특정 핑크몽 조회**
  describe('getPinkmong', () => {
    it('Valkey 캐시에 핑크몽이 있는 경우, 캐시된 데이터를 반환해야 한다.', async () => {
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

    it('존재하지 않는 핑크몽을 조회하면 NotFoundException을 발생시켜야 한다.', async () => {
      valkeyService.get.mockResolvedValue(null);
      pinkmongRepository.findById.mockResolvedValue(null);

      await expect(pinkmongService.getPinkmong(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // **핑크몽 생성**
  describe('createPinkmong(핑크몽 생성)', () => {
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
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: undefined,
        catch_pinkmong: expect.any(Array),
        collection: expect.any(Array),
      });
      expect(s3Service.uploadFile).toHaveBeenCalledWith(file);
    });
  });

  // **핑크몽 삭제**
  describe('deletePinkmong(핑크몽 삭제제)', () => {
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

    it('존재하지 않는 핑크몽을 삭제하면 NotFoundException을 발생시켜야 한다.', async () => {
      pinkmongRepository.findById.mockResolvedValue(null);

      await expect(pinkmongService.deletePinkmong(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
