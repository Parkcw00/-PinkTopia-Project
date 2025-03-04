import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { UserGuard } from '../user/guards/user-guard';

// 엔티티 모킹
jest.mock('./entities/item.entity', () => ({
  Item: class MockItem {}
}));

describe('ItemController', () => {
  let controller: ItemController;
  let service: ItemService;

  const mockItemService = {
    purchaseItem: jest.fn(),
    sellItem: jest.fn(),
  };

  const mockItem = {
    id: 1,
    count: 5,
    inventory_id: 1,
    store_item_id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: mockItemService,
        }
      ],
    })
    .overrideGuard(UserGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ItemController>(ItemController);
    service = module.get<ItemService>(ItemService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('purchaseItem', () => {
    it('아이템을 구매해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const mockCreateDto = {
        storeItemId: 1,
        count: 5,
        paymentMethod: 'gem' as const,
      };

      const expectedResponse = {
        item: mockItem,
        message: '아이템 구매 성공',
      };

      mockItemService.purchaseItem.mockResolvedValue(expectedResponse);

      const result = await controller.purchaseItem(mockUser, mockCreateDto);

      expect(service.purchaseItem).toHaveBeenCalledWith(
        mockUser.user.id,
        mockCreateDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('sellItem', () => {
    it('아이템을 판매해야 합니다', async () => {
      const mockUser = { user: { id: 1 } };
      const itemId = '1';
      const mockUpdateDto = {
        count: 2,
      };

      const expectedResponse = {
        message: '아이템 판매 성공',
      };

      mockItemService.sellItem.mockResolvedValue(expectedResponse);

      const result = await controller.sellItem(mockUser, itemId, mockUpdateDto);

      expect(service.sellItem).toHaveBeenCalledWith(
        mockUser.user.id,
        +itemId,
        mockUpdateDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
