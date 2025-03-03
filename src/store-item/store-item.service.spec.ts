import { Test, TestingModule } from '@nestjs/testing';
import { StoreItemService } from './store-item.service';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyService } from 'src/valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';

// 엔티티 모킹 추가
jest.mock('src/item/entities/item.entity', () => ({
  Item: class MockItem {}
}));

jest.mock('./entities/store-item.entity', () => ({
  StoreItem: class MockStoreItem {}
}));

describe('StoreItemService', () => {
  let service: StoreItemService;
  let repository: StoreItemRepository;
  let s3Service: S3Service;
  let valkeyService: ValkeyService;

  const mockStoreItemRepository = {
    findAll: jest.fn(),
    storeItemFindOne: jest.fn(),
    addShopItem: jest.fn(),
    updateStoreItem: jest.fn(),
    deleteStoreItem: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreItemService,
        {
          provide: StoreItemRepository,
          useValue: mockStoreItemRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: ValkeyService,
          useValue: mockValkeyService,
        },
      ],
    }).compile();

    service = module.get<StoreItemService>(StoreItemService);
    repository = module.get<StoreItemRepository>(StoreItemRepository);
    s3Service = module.get<S3Service>(S3Service);
    valkeyService = module.get<ValkeyService>(ValkeyService);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('캐시된 데이터가 있으면 Valkey에서 데이터를 반환해야 합니다', async () => {
      const cachedItems = [{ id: 1, name: '캐시된 아이템' }];
      mockValkeyService.get.mockResolvedValue(cachedItems);

      const result = await service.findAll();

      expect(valkeyService.get).toHaveBeenCalledWith('store_items');
      expect(result).toEqual(cachedItems);
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('캐시된 데이터가 없으면 DB에서 조회하고 캐시해야 합니다', async () => {
      const dbItems = [{ id: 1, name: 'DB 아이템' }];
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.findAll.mockResolvedValue(dbItems);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalledWith('store_items', dbItems, 300);
      expect(result).toEqual(dbItems);
    });
  });

  describe('storeItemFindOne', () => {
    it('존재하는 아이템을 조회해야 합니다', async () => {
      const itemId = 1;
      const item = { id: itemId, name: '테스트 아이템' };
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(item);

      const result = await service.storeItemFindOne(itemId);

      expect(result).toEqual(item);
      expect(valkeyService.set).toHaveBeenCalledWith(`store_item:${itemId}`, item, 300);
    });

    it('존재하지 않는 아이템 조회 시 에러를 던져야 합니다', async () => {
      const itemId = 999;
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(service.storeItemFindOne(itemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addShopItem', () => {
    it('새로운 상점 아이템을 추가해야 합니다', async () => {
      const mockFile = { filename: 'test.jpg' } as Express.Multer.File;
      const createDto = { name: '새 아이템', gem_price: 100, dia_price: 50 };
      const imageUrl = 'https://example.com/test.jpg';
      const expectedItem = { ...createDto, item_image: imageUrl };

      mockS3Service.uploadFile.mockResolvedValue(imageUrl);
      mockStoreItemRepository.addShopItem.mockResolvedValue(expectedItem);

      const result = await service.addShopItem({} as Request, createDto, mockFile);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(repository.addShopItem).toHaveBeenCalledWith({
        ...createDto,
        item_image: imageUrl,
      });
      expect(result).toEqual(expectedItem);
    });
  });

  describe('updateStoreItem', () => {
    it('존재하는 아이템을 수정해야 합니다', async () => {
      const itemId = 1;
      const updateDto = { name: '수정된 아이템' };
      const existingItem = { id: itemId, name: '기존 아이템', item_image: 'old.jpg' };
      const updatedItem = { ...existingItem, ...updateDto };

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(existingItem);
      mockStoreItemRepository.updateStoreItem.mockResolvedValue(updatedItem);

      const result = await service.updateStoreItem({} as Request, itemId, updateDto);

      expect(repository.updateStoreItem).toHaveBeenCalledWith(itemId, {
        ...updateDto,
        item_image: existingItem.item_image,
      });
      expect(result).toEqual(updatedItem);
    });

    it('존재하지 않는 아이템 수정 시 에러를 던져야 합니다', async () => {
      const itemId = 999;
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(
        service.updateStoreItem({} as Request, itemId, { name: '수정' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStoreItem', () => {
    it('존재하는 아이템을 삭제해야 합니다', async () => {
      const itemId = 1;
      const existingItem = { id: itemId, name: '삭제할 아이템' };
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(existingItem);

      await service.deleteStoreItem({} as Request, itemId);

      expect(repository.deleteStoreItem).toHaveBeenCalledWith(itemId);
    });

    it('존재하지 않는 아이템 삭제 시 에러를 던져야 합니다', async () => {
      const itemId = 999;
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(
        service.deleteStoreItem({} as Request, itemId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
