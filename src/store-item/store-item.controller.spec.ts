import { Test, TestingModule } from '@nestjs/testing';
import { StoreItemController } from './store-item.controller';
import { StoreItemService } from './store-item.service';

// 엔티티 모킹 추가
jest.mock('../../src/item/entities/item.entity', () => ({
  Item: class MockItem {}
}));

describe('StoreItemController', () => {
  let controller: StoreItemController;
  let service: StoreItemService;

  const mockStoreItemService = {
    addShopItem: jest.fn(),
    findAll: jest.fn(),
    storeItemFindOne: jest.fn(),
    updateStoreItem: jest.fn(),
    deleteStoreItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreItemController],
      providers: [
        {
          provide: StoreItemService,
          useValue: mockStoreItemService,
        },
      ],
    }).compile();

    controller = module.get<StoreItemController>(StoreItemController);
    service = module.get<StoreItemService>(StoreItemService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('상점 아이템을 생성해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const mockCreateDto = { 
        name: '테스트 아이템', 
        price: 100,
        gem_price: 100,
        dia_price: 50
      };
      const mockFile = { filename: 'test.jpg' } as Express.Multer.File;
      const expectedResult = { id: 1, ...mockCreateDto };

      mockStoreItemService.addShopItem.mockResolvedValue(expectedResult);

      const result = await controller.create(mockReq, mockCreateDto, mockFile);

      expect(service.addShopItem).toHaveBeenCalledWith(
        mockReq.user,
        mockCreateDto,
        mockFile,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('모든 상점 아이템을 조회해야 합니다', async () => {
      const expectedItems = [
        { id: 1, name: '아이템1' },
        { id: 2, name: '아이템2' },
      ];

      mockStoreItemService.findAll.mockResolvedValue(expectedItems);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedItems);
    });
  });

  describe('findOne', () => {
    it('특정 상점 아이템을 조회해야 합니다', async () => {
      const itemId = 1;
      const expectedItem = { id: itemId, name: '테스트 아이템' };

      mockStoreItemService.storeItemFindOne.mockResolvedValue(expectedItem);

      const result = await controller.findOne(itemId);

      expect(service.storeItemFindOne).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(expectedItem);
    });
  });

  describe('update', () => {
    it('상점 아이템을 수정해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const itemId = 1;
      const mockUpdateDto = { name: '수정된 아이템' };
      const mockFile = { filename: 'updated.jpg' } as Express.Multer.File;
      const expectedResult = { id: itemId, ...mockUpdateDto };

      mockStoreItemService.updateStoreItem.mockResolvedValue(expectedResult);

      const result = await controller.update(
        mockReq,
        itemId,
        mockUpdateDto,
        mockFile,
      );

      expect(service.updateStoreItem).toHaveBeenCalledWith(
        mockReq.user,
        itemId,
        mockUpdateDto,
        mockFile,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('상점 아이템을 삭제해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const itemId = 1;
      const expectedResult = { success: true };

      mockStoreItemService.deleteStoreItem.mockResolvedValue(expectedResult);

      const result = await controller.delete(mockReq, itemId);

      expect(service.deleteStoreItem).toHaveBeenCalledWith(mockReq.user, itemId);
      expect(result).toEqual(expectedResult);
    });
  });
});
