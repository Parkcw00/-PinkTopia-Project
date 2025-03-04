import { Test, TestingModule } from '@nestjs/testing';
import { ItemService } from './item.service';
import { ItemRepository } from './item.repository';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { UserRepository } from '../user/user.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';

// 엔티티 모킹
jest.mock('./entities/item.entity', () => ({
  Item: class MockItem {}
}));

// S3Service 모킹
jest.mock('../s3/s3.service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('mocked-image-url.jpg'),
  }))
}));

// ValkeyService 모킹
jest.mock('../valkey/valkey.service', () => ({
  ValkeyService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }))
}));

describe('ItemService', () => {
  let service: ItemService;
  let itemRepository: ItemRepository;
  let storeItemRepository: StoreItemRepository;
  let inventoryRepository: InventoryRepository;
  let userRepository: UserRepository;
  let valkeyService: ValkeyService;

  const mockItemRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneByItemId: jest.fn(),
    findOneByInventoryIdAndStoreItemId: jest.fn(),
    buyItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
  };

  const mockStoreItemRepository = {
    storeItemFindOne: jest.fn(),
  };

  const mockInventoryRepository = {
    findOneByUserId: jest.fn(),
  };

  const mockUserRepository = {
    findUserId: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockItem = {
    id: 1,
    count: 5,
    inventory_id: 1,
    store_item_id: 1,
  };

  const mockStoreItem = {
    id: 1,
    name: '테스트 아이템',
    item_image: 'test.jpg',
    potion: false,
    potion_time: 0,
    gem_price: 100,
    dia_price: 50,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: ItemRepository,
          useValue: mockItemRepository,
        },
        {
          provide: StoreItemRepository,
          useValue: mockStoreItemRepository,
        },
        {
          provide: InventoryRepository,
          useValue: mockInventoryRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ValkeyService,
          useValue: mockValkeyService,
        },
      ],
    }).compile();

    service = module.get<ItemService>(ItemService);
    itemRepository = module.get<ItemRepository>(ItemRepository);
    storeItemRepository = module.get<StoreItemRepository>(StoreItemRepository);
    inventoryRepository = module.get<InventoryRepository>(InventoryRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    valkeyService = module.get<ValkeyService>(ValkeyService);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('purchaseItem', () => {
    it('젬으로 아이템을 구매해야 합니다', async () => {
      const userId = 1;
      const mockCreateDto = {
        storeItemId: 1,
        count: 5,
        paymentMethod: 'gem' as const,
      };

      const mockUser = {
        id: 1,
        pink_gem: 1000,
        pink_dia: 1000,
      };

      const mockInventory = {
        id: 1,
        user_id: 1,
      };

      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(mockStoreItem);
      mockUserRepository.findUserId.mockResolvedValue(mockUser);
      mockInventoryRepository.findOneByUserId.mockResolvedValue(mockInventory);
      mockItemRepository.findOneByInventoryIdAndStoreItemId.mockResolvedValue(null);
      mockItemRepository.buyItem.mockResolvedValue(mockItem);

      const result = await service.purchaseItem(userId, mockCreateDto);

      expect(result).toHaveProperty('item');
      expect(result).toHaveProperty('message');
      expect(mockUserRepository.updateUser).toHaveBeenCalled();
    });
  });

  describe('sellItem', () => {
    it('아이템을 판매해야 합니다', async () => {
      const userId = 1;
      const itemId = 1;
      const mockUpdateDto = {
        count: 2,
      };

      const mockUser = {
        id: 1,
        pink_gem: 1000,
      };

      const mockInventory = {
        id: 1,
        user_id: 1,
      };

      mockInventoryRepository.findOneByUserId.mockResolvedValue(mockInventory);
      mockItemRepository.findOneByItemId.mockResolvedValue(mockItem);
      mockStoreItemRepository.storeItemFindOne.mockResolvedValue(mockStoreItem);
      mockUserRepository.findUserId.mockResolvedValue(mockUser);

      const result = await service.sellItem(userId, itemId, mockUpdateDto);

      expect(result).toHaveProperty('message');
      expect(mockValkeyService.del).toHaveBeenCalledWith('invenItems:');
    });

    it('존재하지 않는 아이템 판매 시 NotFoundException을 던져야 합니다', async () => {
      const userId = 1;
      const itemId = 999;
      const mockUpdateDto = {
        count: 1,
      };

      mockInventoryRepository.findOneByUserId.mockResolvedValue({ id: 1 });
      mockItemRepository.findOneByItemId.mockResolvedValue(null);

      await expect(
        service.sellItem(userId, itemId, mockUpdateDto)
      ).rejects.toThrow(NotFoundException);
    });
  });
});
