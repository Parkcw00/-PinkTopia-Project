import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongRepository } from './pinkmong.repository';
import { Repository } from 'typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PinkmongRepository', () => {
  let pinkmongRepository: PinkmongRepository;
  let repository: jest.Mocked<Repository<Pinkmong>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinkmongRepository,
        {
          provide: getRepositoryToken(Pinkmong),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    pinkmongRepository = module.get<PinkmongRepository>(PinkmongRepository);
    repository = module.get(getRepositoryToken(Pinkmong));
  });

  it('should be defined', () => {
    expect(pinkmongRepository).toBeDefined();
  });

  // 1️⃣ **특정 핑크몽 조회**
  describe('findById', () => {
    it('should return a pinkmong when found', async () => {
      const pinkmong: Pinkmong = {
        id: 1,
        name: '핑크몽A',
        pinkmong_image: 'https://s3.example.com/imageA.png',
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

      repository.findOne.mockResolvedValue(pinkmong);

      const result = await pinkmongRepository.findById(1);

      expect(result).toEqual(pinkmong);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if pinkmong not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await pinkmongRepository.findById(1);

      expect(result).toBeNull();
    });
  });

  // 2️⃣ **모든 핑크몽 조회**
  describe('findAll', () => {
    it('should return all pinkmongs', async () => {
      const pinkmongs: Pinkmong[] = [
        {
          id: 1,
          name: '핑크몽A',
          pinkmong_image: 'https://s3.example.com/imageA.png',
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
        {
          id: 2,
          name: '핑크몽B',
          pinkmong_image: 'https://s3.example.com/imageB.png',
          explain: '핑크몽 설명',
          region_theme: 'desert',
          grade: 'rare',
          point: 80,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: undefined,
          catch_pinkmong: [],
          collection: [],
        },
      ];

      repository.find.mockResolvedValue(pinkmongs);

      const result = await pinkmongRepository.findAll();

      expect(result).toEqual(pinkmongs);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  // 3️⃣ **핑크몽 생성**
  describe('createPinkmong', () => {
    it('should create and return a pinkmong', async () => {
      const pinkmongData = {
        name: '새 핑크몽',
        pinkmong_image: 'https://s3.example.com/new.png',
        explain: '새로운 핑크몽입니다.',
        region_theme: 'city',
        grade: 'legendary',
        point: 200,
      };

      const savedPinkmong: Pinkmong = {
        id: 3,
        ...pinkmongData,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };

      repository.create.mockReturnValue(savedPinkmong);
      repository.save.mockResolvedValue(savedPinkmong);

      const result = await pinkmongRepository.createPinkmong(pinkmongData);

      expect(result).toEqual(savedPinkmong);
      expect(repository.create).toHaveBeenCalledWith(pinkmongData);
      expect(repository.save).toHaveBeenCalledWith(savedPinkmong);
    });
  });

  // 4️⃣ **핑크몽 업데이트**
  describe('updatePinkmong', () => {
    it('should update and return the pinkmong', async () => {
      const pinkmong: Pinkmong = {
        id: 1,
        name: '수정된 핑크몽',
        pinkmong_image: 'https://s3.example.com/updated.png',
        explain: '업데이트된 설명입니다.',
        region_theme: 'ocean',
        grade: 'epic',
        point: 150,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };

      repository.save.mockResolvedValue(pinkmong);

      const result = await pinkmongRepository.updatePinkmong(pinkmong);

      expect(result).toEqual(pinkmong);
      expect(repository.save).toHaveBeenCalledWith(pinkmong);
    });
  });

  // 5️⃣ **핑크몽 삭제**
  describe('deletePinkmong', () => {
    it('should delete a pinkmong', async () => {
      const pinkmong: Pinkmong = {
        id: 1,
        name: '핑크몽',
        pinkmong_image: 'https://s3.example.com/image.png',
        explain: '삭제할 핑크몽입니다.',
        region_theme: 'forest',
        grade: 'common',
        point: 50,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };

      await pinkmongRepository.deletePinkmong(pinkmong);

      expect(repository.remove).toHaveBeenCalledWith(pinkmong);
    });
  });
});
