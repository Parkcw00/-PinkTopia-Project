import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { ItemRepository } from '../item/item.repository';
import { InventoryRepository } from './inventory.repository';
import { UserRepository } from '../user/user.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: InventoryRepository;
  let itemRepository: ItemRepository;
  let valkeyService: ValkeyService;

  const mockInventoryRepository = {
    findOneByUserId: jest.fn(),
    createInventory: jest.fn(),
  };

  const mockItemRepository = {
    findItemsByInventoryId: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockInventory = {
    id: 1,
    user_id: 1,
  };

  const mockItems = [
    {
      id: 1,
      count: 2,
      store_item: {
        name: '테스트 아이템',
        item_image: 'test.jpg',
        potion: true,
        potion_time: 30,
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: InventoryRepository,
          useValue: mockInventoryRepository,
        },
        {
          provide: ItemRepository,
          useValue: mockItemRepository,
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

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<InventoryRepository>(InventoryRepository);
    itemRepository = module.get<ItemRepository>(ItemRepository);
    valkeyService = module.get<ValkeyService>(ValkeyService);

    // 각 테스트 전에 모든 mock 함수 초기화
    jest.clearAllMocks();
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('createInventory', () => {
    it('인벤토리를 생성해야 합니다', async () => {
      const createInventoryDto = { user_id: 1 };
      mockInventoryRepository.createInventory.mockResolvedValue(mockInventory);

      const result = await service.createInventory(createInventoryDto);

      expect(result).toEqual(mockInventory);
      expect(mockInventoryRepository.createInventory).toHaveBeenCalledWith(createInventoryDto);
    });
  });

  describe('findItemsByUserId', () => {
    it('유저의 인벤토리 아이템을 조회해야 합니다', async () => {
      const userId = 1;
      const expectedItems = mockItems.map(item => ({
        id: item.id,
        count: item.count,
        storeItemName: item.store_item.name,
        storeItemImage: item.store_item.item_image,
        potion: item.store_item.potion,
        potionTime: item.store_item.potion_time,
      }));

      mockValkeyService.get.mockResolvedValue(null);
      mockInventoryRepository.findOneByUserId.mockResolvedValue(mockInventory);
      mockItemRepository.findItemsByInventoryId.mockResolvedValue(mockItems);

      const result = await service.findItemsByUserId(userId);

      expect(result).toEqual(expectedItems);
      expect(mockValkeyService.set).toHaveBeenCalledWith(
        `invenItems:${userId}`,
        expectedItems,
        600,
      );
    });

    it('캐시된 데이터가 있으면 캐시된 데이터를 반환해야 합니다', async () => {
      const userId = 1;
      const expectedItems = mockItems.map(item => ({
        id: item.id,
        count: item.count,
        storeItemName: item.store_item.name,
        storeItemImage: item.store_item.item_image,
        potion: item.store_item.potion,
        potionTime: item.store_item.potion_time,
      }));

      mockInventoryRepository.findOneByUserId.mockResolvedValue(mockInventory);
      mockItemRepository.findItemsByInventoryId.mockResolvedValue(mockItems);
      mockValkeyService.get.mockResolvedValue(expectedItems);

      const result = await service.findItemsByUserId(userId);

      expect(result).toEqual(expectedItems);
      expect(mockValkeyService.get).toHaveBeenCalledWith(`invenItems:${userId}`);
      expect(mockValkeyService.set).not.toHaveBeenCalled();
    });

    it('인벤토리가 없으면 NotFoundException을 던져야 합니다', async () => {
      const userId = 999;
      mockValkeyService.get.mockResolvedValue(null);
      mockInventoryRepository.findOneByUserId.mockResolvedValue(null);

      await expect(service.findItemsByUserId(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
