import { Test, TestingModule } from '@nestjs/testing';
import { StoreItemService } from './store-item.service';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('./entities/store-item.entity', () => ({
  StoreItem: class MockStoreItem {}
}));

jest.mock('../s3/s3.service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('mocked-image-url.jpg'),
  }))
}));

jest.mock('../valkey/valkey.service', () => ({
  ValkeyService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }))
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
    uploadFile: jest.fn().mockResolvedValue('mocked-image-url.jpg'),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockStoreItem = {
    id: 1,
    name: '테스트 아이템',
    item_image: 'test.jpg',
    potion: false,
    potion_time: 0,
    gem_price: 100,
    dia_price: 50,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
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
    it('모든 상점 아이템을 조회해야 합니다', async () => {
      const expectedItems = [mockStoreItem];
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.findAll.mockResolvedValue(expectedItems);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalledWith('store_items', expectedItems, 300);
      expect(result).toEqual(expectedItems);
    });
  });

  describe('storeItemFindOne', () => {
    it('특정 상점 아이템을 조회해야 합니다', async () => {
      const itemId = 1;
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(mockStoreItem);

      const result = await service.storeItemFindOne(itemId);

      expect(repository.storeItemFindOne).toHaveBeenCalledWith(itemId);
      expect(valkeyService.set).toHaveBeenCalledWith(`store_item:${itemId}`, mockStoreItem, 300);
      expect(result).toEqual(mockStoreItem);
    });

    it('존재하지 않는 아이템 조회 시 NotFoundException을 던져야 합니다', async () => {
      const itemId = 999;
      mockValkeyService.get.mockResolvedValue(null);
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(service.storeItemFindOne(itemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addShopItem', () => {
    it('새로운 상점 아이템을 추가해야 합니다', async () => {
      const mockUser = { id: 1 };
      const mockCreateDto = {
        name: '테스트 아이템',
        potion: false,
        potion_time: 0,
        gem_price: 100,
        dia_price: 50,
      };
      const mockFile = { filename: 'test.jpg' } as Express.Multer.File;

      mockStoreItemRepository.addShopItem.mockResolvedValue(mockStoreItem);

      const result = await service.addShopItem(mockUser as any, mockCreateDto, mockFile);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(repository.addShopItem).toHaveBeenCalledWith({
        ...mockCreateDto,
        item_image: 'mocked-image-url.jpg',
      });
      expect(result).toEqual(mockStoreItem);
    });
  });

  describe('updateStoreItem', () => {
    it('상점 아이템을 수정해야 합니다', async () => {
      const mockUser = { id: 1 };
      const itemId = 1;
      const mockUpdateDto = {
        name: '수정된 아이템',
        potion: true,
        potion_time: 30,
      };
      const mockFile = { filename: 'updated.jpg' } as Express.Multer.File;

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(mockStoreItem);
      const updatedItem = { ...mockStoreItem, ...mockUpdateDto, item_image: 'mocked-image-url.jpg' };
      mockStoreItemRepository.updateStoreItem.mockResolvedValue(updatedItem);

      const result = await service.updateStoreItem(mockUser as any, itemId, mockUpdateDto, mockFile);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(repository.updateStoreItem).toHaveBeenCalledWith(itemId, {
        ...mockUpdateDto,
        item_image: 'mocked-image-url.jpg',
      });
      expect(result).toEqual(updatedItem);
    });

    it('존재하지 않는 아이템 수정 시 NotFoundException을 던져야 합니다', async () => {
      const mockUser = { id: 1 };
      const itemId = 999;
      const mockUpdateDto = { name: '수정된 아이템' };

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(
        service.updateStoreItem(mockUser as any, itemId, mockUpdateDto)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStoreItem', () => {
    it('상점 아이템을 삭제해야 합니다', async () => {
      const mockUser = { id: 1 };
      const itemId = 1;

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(mockStoreItem);

      await service.deleteStoreItem(mockUser as any, itemId);

      expect(repository.deleteStoreItem).toHaveBeenCalledWith(itemId);
    });

    it('존재하지 않는 아이템 삭제 시 NotFoundException을 던져야 합니다', async () => {
      const mockUser = { id: 1 };
      const itemId = 999;

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(null);

      await expect(
        service.deleteStoreItem(mockUser as any, itemId)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
