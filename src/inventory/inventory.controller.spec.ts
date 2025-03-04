import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { UserGuard } from '../user/guards/user-guard';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    findItemsByUserId: jest.fn(),
  };

  const mockItems = [
    {
      id: 1,
      count: 2,
      storeItemName: '테스트 아이템',
      storeItemImage: 'test.jpg',
      potion: true,
      potionTime: 30,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('findItemsInInventory', () => {
    it('유저의 인벤토리 아이템을 조회해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      mockInventoryService.findItemsByUserId.mockResolvedValue(mockItems);

      const result = await controller.findItemsInInventory(mockReq);

      expect(service.findItemsByUserId).toHaveBeenCalledWith(mockReq.user.id);
      expect(result).toEqual(mockItems);
    });
  });
});
